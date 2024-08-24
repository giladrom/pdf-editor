"use client";

import {
  Box,
  Text,
  ScrollArea,
  Flex,
  Button,
  Badge,
  Stack,
  Accordion,
  List,
  ThemeIcon,
  rem,
  NavLink,
  Group,
} from "@mantine/core";
import { api } from "~/trpc/react";
import { Uploader } from "./uploader";
import { useEffect } from "react";

type Props = {
  setDocument: (documentId: string) => void;
  setRevision: (revisionId: string) => void;
  refresh: boolean;
  setRefresh: (refresh: boolean) => void;
};

// Display a list of all uploaded documents, including names, creation dates, and revision counts
export default function DocumentList(props: Props) {
  const { data: files } = api.document.list.useQuery({
    // Pass the refresh flag to the query to trigger a re-fetch of the file list
    refresh: props.refresh.toString(),
  });

  // Load the initial list of files on first render
  useEffect(() => {
    props.setRefresh && props.setRefresh(!props.refresh);
  }, []);

  return (
    <Box w={300}>
      <Box mb="md">
        {/* Uploader component for uploading new files. 
        When a file is uploaded, the refresh flag is set to true to trigger a re-fetch of the file list. */}
        <Uploader
          done={() => props.setRefresh && props.setRefresh(!props.refresh)}
        />
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
              <Stack gap="xs">
                <Group w="100%">
                  <Stack>
                    <Text truncate style={{ flex: 1 }}>
                      {file.name}
                    </Text>
                    <Text size="xs" color="dimmed">
                      Created{" "}
                      {`${file.createdAt.toLocaleDateString()}  ${file.createdAt.toLocaleTimeString()}`}
                    </Text>
                  </Stack>
                  <Button
                    size="xs"
                    variant="light"
                    onClick={() => {
                      props.setDocument(file.id.toString());
                      props.setRevision("");
                    }}
                  >
                    Edit
                  </Button>
                </Group>
                <Accordion>
                  <Accordion.Item value="1">
                    <Accordion.Control>
                      <Text size="xs" color="dimmed">
                        {file.revisions.length} revisions
                      </Text>
                    </Accordion.Control>
                    <Accordion.Panel>
                      {file.revisions.map((revision, index) => (
                        <NavLink
                          label={`Revision ${index + 1}`}
                          description={`${revision.createdAt.toLocaleDateString()}  ${revision.createdAt.toLocaleTimeString()}`}
                          onClick={() => {
                            props.setRevision(revision.id.toString());
                            props.setDocument(file.id.toString());
                          }}
                          key={index}
                        />
                      ))}
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </Stack>
            </Flex>
          ))}
        </Flex>
      </ScrollArea>
    </Box>
  );
}
