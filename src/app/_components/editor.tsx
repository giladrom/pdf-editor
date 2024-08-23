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
import { Box, Flex } from "@mantine/core";
import { IconDeviceFloppy, IconFile } from "@tabler/icons-react";

const content = "This is the default editor content";

type Props = {
  documentId?: string;
  revisionId?: string;
  refresh: boolean;
  setRefresh: (refresh: boolean) => void;
};

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
            onSuccess: () => {
              setLoading(false);
              setRefresh(!refresh);
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
      editor?.commands.setContent(document.content);
    }
  }, [document]);

  return (
    <Flex direction="column" h="100%">
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
        </RichTextEditor.Toolbar>

        <RichTextEditor.Content />
      </RichTextEditor>
    </Flex>
  );
}
