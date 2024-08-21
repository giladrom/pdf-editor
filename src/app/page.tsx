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

const mockFiles = [
  "document1.pdf",
  "image1.jpg",
  "spreadsheet.xlsx",
  "presentation.pptx",
  "notes.txt",
  "report.docx",
  "data.csv",
  "screenshot.png",
  "audio.mp3",
  "video.mp4",
];

export default async function Home() {
  return (
    <Box h="100vh" p="md">
      <Title order={2} ta="center" mb="xl">
        Demo PDF Editor
      </Title>
      <Group align="flex-start" h="calc(100vh - 100px)">
        <Box w={300}>
          <Text fw={700} mb="xs">
            Previously Uploaded Files:
          </Text>
          <ScrollArea h="calc(100vh - 150px)" scrollbarSize={6}>
            <Flex direction="column" gap="xs">
              {mockFiles.map((file, index) => (
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
                  <Text truncate style={{ flex: 1 }}>
                    {file}
                  </Text>
                  <Button size="xs" variant="light">
                    Edit
                  </Button>
                </Flex>
              ))}
            </Flex>
          </ScrollArea>
        </Box>
        <Box flex={1} mih={200}>
          <Uploader />
          <Editor />
        </Box>
      </Group>
    </Box>
  );
}
