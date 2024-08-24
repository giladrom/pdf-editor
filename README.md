# PDF Editor

This is a simple one-page app that enables the user to easily upload a PDF file and edit the resulting document using a built-in rich text editor,
supporting basic editing (Rich text and Search/Replace), including document revisions.

## Tech Stack

- Next.JS + React + tRPC (TypeScript)
- Prisma ORM + Postgres (Neon)
- Mantine UI
- Tiptap Rich Text Editor
- pdf2json
- Vercel (Hosting/Blob storage)

## Implementation Notes

### DevOps

1. Used t3.gg + Mantine template for project scaffolding: This provides a very quick way to set up a typesafe full-stack environment based on Next.JS.
2. Set up a Neon database to store our parsed PDF documents and new revisions.
3. Set up a GitHub repository and a new Vercel project to deploy and manage Blob storage for uploaded PDFs.

### Implementation

The UX is composed of a single page with a few components:

1. File uploader: This allows the user to upload a PDF file, providing a graphical feedback on the upload process.
2. Document list: This shows a list of all uploaded documents, allowing the user to select one to edit. Additionally, each document has a collapsible list of revisions, allowing the user to select a specific revision to edit.
3. Editor: This is the main component of the app, allowing the user to edit the selected document. The editor is a Tiptap rich text editor, supporting basic editing (Rich text), and undo/redo.

### Application Flow

#### Uploading a Document

When a document is uploaded, it is stored in a Vercel Blob storage, and a new record is created in the database.
Vercel then notifies the app of the new document, and the backend begins parsing the PDF document.

> The PDF Library being used is pdf2json, which is a JavaScript library for parsing PDF documents. It does not have full support for all PDF features, but it does support the features we need for this app. If the library fails to parse a document, the user is notified and the document is not saved.

> Additionally, Support for full PDF formatting is beyond the scope of this app, so any formatting beyond simple line breaks is lost when the document is parsed.

Once the document is parsed, the user is presented with an updated document list, and is able to select a document to edit.

#### Editing and saving a Document

When the user clicks the "Save" button, the editor's content is saved to the database as a new revision of the document, and the document list is updated to reflect the new revision.

> Note: the document is not saved in real time, so if the user closes the browser or navigates away from the page, the changes will be lost.

#### Searching and Replacing Text

Use the "Search/Replace" button to search for text in the document, and replace it with new text. Repeatedly clicking the button will cycle through the matches in the document.
