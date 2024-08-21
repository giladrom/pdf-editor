"use client";

import {
  Box,
  Text,
  ScrollArea,
  Flex,
  Button,
  Badge,
  Stack,
} from "@mantine/core";
import { api } from "~/trpc/react";
import { Uploader } from "./uploader";
import { useEffect, useState } from "react";

type Props = {
  setDocument: (documentId: string) => void;
};

export default function DocumentList(props: Props) {
  const [refresh, setRefresh] = useState(false);
  const { data: files } = api.document.list.useQuery({
    refresh: refresh.toString(),
  });

  // Load the initial list of files
  useEffect(() => {
    setRefresh(!refresh);
  }, []);

  return (
    <Box w={300}>
      <Box mb="md">
        <Uploader done={() => setRefresh(!refresh)} />
      </Box>
      <Text fw={700} mb="xs">
        Previously Uploaded Files:
      </Text>
      <ScrollArea h="calc(100vh - 350px)" scrollbarSize={6}>
        <Flex direction="column" gap="xs">
          {files?.map((file, index) => (
            <Flex
              key={index}
              justify="space-between"
              align="center"
              p="xs"
              style={(theme) => ({
                border: `1px solid ${theme.colors.gray[3]}`,
                borderRadius: theme.radius.sm,
              })}
            >
              <Stack>
                <Text truncate style={{ flex: 1 }}>
                  {file.name}
                </Text>
                <Text size="xs" color="dimmed">
                  Created{" "}
                  {`${file.createdAt.toLocaleDateString()}  ${file.createdAt.toLocaleTimeString()}`}
                </Text>
                <Badge size="xs" color="gray">
                  {file.revisions.length} revisions
                </Badge>
              </Stack>
              <Button
                size="xs"
                variant="light"
                onClick={() => props.setDocument(file.id.toString())}
              >
                Edit
              </Button>
            </Flex>
          ))}
        </Flex>
      </ScrollArea>
    </Box>
  );
}
