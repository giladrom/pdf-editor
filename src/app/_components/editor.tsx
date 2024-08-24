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

function SearchReplaceControl({
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
        // If we are searching and not replacing, find the next occurrence of the search string
        if (search && !replace) {
          // Get the plain text content of the editor, works better for searching
          const content = editor?.getText();

          const idx = content?.indexOf(search, searchIdx);

          // Found a match, move the cursor to the next occurrence
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
            // No match found, reset the search index
            setSearchIdx(0);
            notifications.show({
              position: "top-right",
              title: "Search/Replace",
              message: "No more occurrences found",
            });
          }
        }

        // If we are replacing, replace all occurrences of the search string with the replace string
        if (search && replace) {
          // Replace directly in the HTML content
          const content = editor?.getHTML();

          console.log("Replace All", search, replace);

          let replaced = 0;

          // Replace all strings and count the number of replacements
          const newContent = content?.replace(new RegExp(search, "g"), () => {
            replaced += 1;
            return replace;
          });

          // Set the new content in the editor
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

        // When "saving" the document, create a new revision with the current content
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
            <SearchReplaceControl
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
