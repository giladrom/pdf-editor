# PDF Editor

This is a simple one-page app that enables the user to easily upload a PDF file and edit the resulting document using a built-in rich text editor,
supporting basic editing (Rich text and Search/Replace), including document revisions.

## Tech Stack
* Next.JS + React + tRPC (TypeScript)
* Prisma ORM + Postgres (Neon)
* Mantine UI
* Tiptap Rich Text Editor
* pdf2json
* Vercel (Hosting/Blob storage)

## Implementation Notes

### DevOps
1. Used t3.gg + Mantine template for project scaffolding: This provides a very quick way to set up a typesafe full-stack environment based on Next.JS.
2. Set up a Neon database to store our parsed PDF documents and new revisions. 
3. Set up a gitHub repository and a new Vercel project to deploy and manage Blob storage for uploaded PDFs.

### Implementation
