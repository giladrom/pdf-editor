import {
  RichTextEditor,
  Link,
  useRichTextEditorContext,
} from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import Highlight from "@tiptap/extension-highlight";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Superscript from "@tiptap/extension-superscript";
import SubScript from "@tiptap/extension-subscript";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import {
  Box,
  Button,
  Flex,
  Group,
  Modal,
  Stack,
  TextInput,
} from "@mantine/core";
import { IconDeviceFloppy, IconFile, IconSearch } from "@tabler/icons-react";
import { Notifications } from "@mantine/notifications";
import { notifications } from "@mantine/notifications";

const content = "This is the default editor content";

type Props = {
  documentId?: string;
  revisionId?: string;
  refresh: boolean;
  setRefresh: (refresh: boolean) => void;
};

function SearchAndReplaceModal({
  opened,
  setOpened,
}: {
  opened: boolean;
  setOpened: (opened: boolean) => void;
}) {
  const [search, setSearch] = useState("");
  const [replace, setReplace] = useState("");
  const { editor } = useRichTextEditorContext();

  return (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      title="Search/Replace"
    >
      <Stack>
        <TextInput
          placeholder=""
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
        <TextInput
          placeholder=""
          value={replace}
          onChange={(e) => setReplace(e.currentTarget.value)}
        />
        <Group justify="flex-end">
          <Button
            onClick={() => {
              setOpened(false);
            }}
          >
            Close
          </Button>
          <Button
            onClick={() => {
              if (search && !replace) {
                const content = editor?.getText();

                const idx = content?.indexOf(search);
                if (idx !== -1) {
                  console.log("Found", idx);
                  const location = (idx ?? 0) + 1;

                  editor?.commands.setTextSelection({
                    from: location,
                    to: location + (search.length ?? 0),
                  });
                } else {
                  notifications.show({
                    position: "top-right",
                    title: "Search/Replace",
                    message: "No occurrences found",
                  });
                }
              }

              if (search && replace) {
                const content = editor?.getHTML();

                console.log("Replace All", search, replace);
                setOpened(false);

                let replaced = 0;
                const newContent = content?.replace(
                  new RegExp(search, "g"),
                  () => {
                    replaced += 1;
                    return replace;
                  },
                );
                editor?.commands.setContent(newContent ?? "");
                notifications.show({
                  position: "top-right",
                  title: "Search/Replace",
                  message: `${replaced} occurrences replaced`,
                });
              }
            }}
          >
            Search/Replace
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function ReplaceAllControl({
  documentId,
  search,
  replace,
  searchIdx,
  setSearchIdx,
}: {
  documentId: string;
  search: string;
  replace: string;
  searchIdx: number;
  setSearchIdx: (searchIdx: number) => void;
}) {
  const { editor } = useRichTextEditorContext();

  return (
    <RichTextEditor.Control
      disabled={!documentId}
      onClick={() => {
        if (search && !replace) {
          const content = editor?.getText();

          const idx = content?.indexOf(search, searchIdx);

          if (idx !== -1) {
            setSearchIdx((idx ?? 0) + 1);
            const location = (idx ?? 0) + 1;

            console.log("Found search string", search, idx);
            editor?.commands.focus(location, { scrollIntoView: true });
            editor?.commands.setTextSelection({
              from: location,
              to: location + (search.length ?? 0),
            });
          } else {
            setSearchIdx(0);
            notifications.show({
              position: "top-right",
              title: "Search/Replace",
              message: "No more occurrences found",
            });
          }
        }

        if (search && replace) {
          const content = editor?.getHTML();

          console.log("Replace All", search, replace);

          let replaced = 0;
          const newContent = content?.replace(new RegExp(search, "g"), () => {
            replaced += 1;
            return replace;
          });
          editor?.commands.setContent(newContent ?? "");
          notifications.show({
            position: "top-right",
            title: "Search/Replace",
            message: `${replaced} occurrences replaced`,
          });
        }
      }}
      title="Search/Replace"
    >
      <IconSearch stroke={1.5} size="1rem" />
    </RichTextEditor.Control>
  );
}

function SearchControl({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (search: string) => void;
}) {
  return (
    <TextInput
      size="xs"
      placeholder="Search"
      value={search}
      onChange={(e) => setSearch(e.currentTarget.value)}
    />
  );
}

function ReplaceControl({
  replace,
  setReplace,
}: {
  replace: string;
  setReplace: (replace: string) => void;
}) {
  return (
    <TextInput
      size="xs"
      placeholder="Replace"
      value={replace}
      onChange={(e) => setReplace(e.currentTarget.value)}
    />
  );
}

function SaveControl({
  documentId,
  refresh,
  setRefresh,
}: {
  documentId: string;
  refresh: boolean;
  setRefresh: (refresh: boolean) => void;
}) {
  const { editor } = useRichTextEditorContext();
  const { mutate: createRevision } = api.document.createRevision.useMutation();
  const [loading, setLoading] = useState(false);

  return (
    <RichTextEditor.Control
      disabled={!documentId}
      onClick={() => {
        setLoading(true);

        console.log("Creating new revision for document", documentId);

        createRevision(
          {
            id: documentId,
            content: editor?.getHTML() ?? "",
          },
          {
            onSuccess: (data) => {
              setLoading(false);
              setRefresh(!refresh);
              notifications.show({
                position: "top-right",
                title: "New Revision",
                message: `New Document Revision Created: ${data}`,
              });
            },
          },
        );
      }}
      title="Save Document"
    >
      <IconDeviceFloppy stroke={1.5} size="1rem" />
    </RichTextEditor.Control>
  );
}

export function Editor(props: Props) {
  const [searchAndReplaceOpened, setSearchAndReplaceOpened] = useState(false);
  const [search, setSearch] = useState("");
  const [replace, setReplace] = useState("");
  const [searchIdx, setSearchIdx] = useState(0);

  const { data: document } = api.document.getById.useQuery(
    {
      id: props.documentId,
      revisionId: props.revisionId,
    },
    {
      enabled: !!props.documentId || !!props.revisionId,
    },
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content,
    immediatelyRender: false,
  });

  useEffect(() => {
    if (document) {
      editor?.commands.setContent(document.content ?? "");
    }
  }, [document]);

  return (
    <>
      {/* Ensure the editor doesn't overflow the page */}
      <Stack>
        <RichTextEditor editor={editor}>
          <RichTextEditor.Toolbar sticky stickyOffset={60}>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Underline />
              <RichTextEditor.Strikethrough />
              <RichTextEditor.ClearFormatting />
              <RichTextEditor.Highlight />
              <RichTextEditor.Code />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.H1 />
              <RichTextEditor.H2 />
              <RichTextEditor.H3 />
              <RichTextEditor.H4 />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Blockquote />
              <RichTextEditor.Hr />
              <RichTextEditor.BulletList />
              <RichTextEditor.OrderedList />
              <RichTextEditor.Subscript />
              <RichTextEditor.Superscript />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Link />
              <RichTextEditor.Unlink />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.AlignLeft />
              <RichTextEditor.AlignCenter />
              <RichTextEditor.AlignJustify />
              <RichTextEditor.AlignRight />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Undo />
              <RichTextEditor.Redo />
            </RichTextEditor.ControlsGroup>
            <SaveControl
              documentId={props.documentId ?? ""}
              refresh={props.refresh}
              setRefresh={props.setRefresh}
            />
            <RichTextEditor.ControlsGroup>
              <SearchControl search={search} setSearch={setSearch} />
              <ReplaceControl replace={replace} setReplace={setReplace} />
            </RichTextEditor.ControlsGroup>
            <ReplaceAllControl
              documentId={props.documentId ?? ""}
              search={search}
              replace={replace}
              searchIdx={searchIdx}
              setSearchIdx={setSearchIdx}
            />
          </RichTextEditor.Toolbar>

          <RichTextEditor.Content />
        </RichTextEditor>
      </Stack>
    </>
  );
}
