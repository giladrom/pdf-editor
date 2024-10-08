"use client";

import { Group, Text, rem } from "@mantine/core";
import { IconUpload, IconPhoto, IconX } from "@tabler/icons-react";
import { Dropzone, DropzoneProps, PDF_MIME_TYPE } from "@mantine/dropzone";
import { api } from "~/trpc/react";

import { type PutBlobResult } from "@vercel/blob";
import { upload } from "@vercel/blob/client";
import { useState, useRef, useEffect } from "react";
import { notifications } from "@mantine/notifications";

type Props = {
  done: () => void;
} & Partial<DropzoneProps>;

export function Uploader(props: Props) {
  const document = api.document.create.useMutation();
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { done, ...rest } = props;

  useEffect(() => {
    if (!blob) return;

    notifications.show({
      title: "Processing document",
      message: "Please wait while we process your document...",
    });

    document.mutate(
      {
        name: blob?.pathname,
        url: blob?.downloadUrl,
      },
      {
        onSuccess: () => {
          console.log("Document created");
          notifications.show({
            title: "Document created",
            message: "Your document has been created",
          });
          done();
        },
        onError: (error) => {
          console.error("Error creating document", error);
          notifications.show({
            color: "red",
            title: "Error creating document",
            message: "There was an error creating your document",
          });
          throw new Error("Error creating document");
        },
      },
    );
  }, [blob]);

  return (
    // <Container>
    <Dropzone
      onDrop={async (files) => {
        setLoading(true);
        console.log("accepted files", files);
        if (!files[0]) return;

        const newBlob = await upload(files[0].name, files[0], {
          access: "public",
          handleUploadUrl: "/api/document/upload",
        });

        setBlob(newBlob);
        setLoading(false);
      }}
      onReject={(files) => console.log("rejected files", files)}
      maxSize={5 * 1024 ** 2}
      accept={PDF_MIME_TYPE}
      loading={loading}
      {...rest}
    >
      <Group
        justify="center"
        gap="xl"
        mih={100}
        style={{ pointerEvents: "none" }}
      >
        <Dropzone.Accept>
          <IconUpload
            style={{
              width: rem(52),
              height: rem(52),
              color: "var(--mantine-color-blue-6)",
            }}
            stroke={1.5}
          />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX
            style={{
              width: rem(52),
              height: rem(52),
              color: "var(--mantine-color-red-6)",
            }}
            stroke={1.5}
          />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconPhoto
            style={{
              width: rem(52),
              height: rem(52),
              color: "var(--mantine-color-dimmed)",
            }}
            stroke={1.5}
          />
        </Dropzone.Idle>

        <div>
          <Text size="xl" ta="center" inline>
            Drag PDF here or click to select files
          </Text>
          <Text size="sm" c="dimmed" ta="center" inline mt={7}>
            Each file should not exceed 5mb
          </Text>
        </div>
      </Group>
    </Dropzone>
    // </Container>
  );
}
