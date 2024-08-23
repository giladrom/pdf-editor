import { z } from "zod";
import PDFParser from "pdf2json";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const parsePdf = (content: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, true);

    pdfParser.on("pdfParser_dataError", (errData) => {
      console.error("Error parsing PDF", errData.parserError);
      reject("Error parsing PDF");
    });

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      console.log("pdfData", pdfData);
      resolve(
        // pdfData.Pages.flatMap((page) => page.Texts)
        //   .map((text) => text?.R[0]?.T)
        //   .join(" "),
        pdfParser.getRawTextContent(),
      );
    });

    pdfParser.parseBuffer(content);
  });
};

export const documentRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ name: z.string().min(1), url: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // Get blob content and set it in an ArrayBuffer
      const blob = await fetch(input.url);
      const buffer = Buffer.from(await blob.arrayBuffer());

      // Parse document content using
      const content = await parsePdf(buffer);
      if (!content) throw new Error("Error parsing PDF");

      return ctx.db.document.create({
        data: {
          name: input.name,
          content: content,
        },
      });
    }),

  createRevision: publicProcedure
    .input(z.object({ id: z.string(), content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.revision.create({
        data: {
          documentId: parseInt(input.id),
          content: input.content,
        },
      });
    }),

  getById: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
        revisionId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (input.revisionId) {
        const revision = await ctx.db.revision.findUnique({
          where: { id: parseInt(input.revisionId) },
        });

        console.log("revision", revision);

        return revision;
      }

      const document = await ctx.db.document.findUnique({
        where: { id: parseInt(input.id ?? "") },
      });

      console.log("document", document);

      // Format document content as HTML
      const content = document?.content
        .replace(/\n/g, "<br>")
        .replace(/----------------Page \((\d+)\) Break----------------/g, "");
      return { ...document, content };
    }),

  list: publicProcedure
    .input(z.object({ refresh: z.string() }))
    .query(({ ctx }) => {
      return ctx.db.document.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          revisions: true,
        },
      });
    }),
});
