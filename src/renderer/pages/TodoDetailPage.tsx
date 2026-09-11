import { useParams } from "react-router-dom";

export default function TodoDetailPage() {
  const { id } = useParams();

  return <h1>Todo {id}</h1>;
}