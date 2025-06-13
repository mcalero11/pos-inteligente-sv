import { JsonEditor } from "json-edit-react";

interface JsonEditorComponentProps {
  data: object;
  setData: (data: object) => void;
}

export default function JsonEditorComponent({
  data,
  setData,
}: JsonEditorComponentProps) {
  return <JsonEditor data={data} setData={setData} />;
}
