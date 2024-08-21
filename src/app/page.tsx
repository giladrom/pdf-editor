"use client";

import {
  Text,
  Title,
  Group,
  Box,
  ScrollArea,
  Button,
  Flex,
} from "@mantine/core";
import { Uploader } from "./_components/uploader";
import { Editor } from "./_components/editor";
import DocumentList from "./_components/documentlist";
import { useState } from "react";

export default function Home() {
  const [documentId, setDocumentId] = useState<string | null>(null);

  return (
    <Flex direction="column" h="100vh" w="100%">
      <Box p="md" bg="gray.1">
        <Title order={2} ta="center">
          Demo PDF Editor [Hazel]
        </Title>
      </Box>
      <Flex flex={1} p="md">
        <Box w={300} mr="md">
          <DocumentList setDocument={setDocumentId} />
        </Box>
        <Flex direction="column" style={{ flex: 1 }}>
          <Box flex={1}>
            <Editor documentId={documentId} />
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
}
