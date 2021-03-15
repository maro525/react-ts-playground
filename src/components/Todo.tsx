import React from "react";
import { Provider, atom, useAtom } from "jotai";
import { atomFamily } from "jotai/utils";
import { nanoid } from "nanoid";
import { Radio } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { a, useTransition } from "@react-spring/web";

type Param = { id: string; title?: string };
const todoAtomFamily = atomFamily(
  (param: Param) => ({ title: param.title || "No title", completed: false }),
  null,
  (a: Param, b: Param) => a.id === b.id
);

const filterAtom = atom("all");
const todosAtom = atom<string[]>([]);
const filteredAtom = atom((get) => {
  const filter = get(filterAtom);
  const todos = get(todosAtom);
  if (filter === "all") return todos;
  else if (filter === "completed")
    return todos.filter((id) => get(todoAtomFamily({ id })).completed);
  else return todos.filter((id) => !get(todoAtomFamily({ id })).completed);
});

const TodoItem: React.FC<{
  id: string;
  remove: (id: string) => void;
}> = ({ id, remove }) => {
  const [item, setItem] = useAtom(todoAtomFamily({ id }));
  const toggleCompleted = () =>
    setItem({ ...item, completed: !item.completed });
  return (
    <>
      <input
        type="checkbox"
        checked={item.completed}
        onChange={toggleCompleted}
      />
      <span style={{ textDecoration: item.completed ? "line-through" : "" }}>
        {item.title}
      </span>
      <CloseOutlined onClick={() => remove(id)} />
    </>
  );
};

const Filtered: React.FC<{
  remove: (id: string) => void;
}> = ({ remove }) => {
  const [todos] = useAtom(filteredAtom);
  const transitions = useTransition(todos, {
    keys: (id: string) => id,
    from: { opacity: 0, height: 0 },
    enter: { opacity: 1, height: 40 },
    leave: { opacity: 0, height: 0 },
  });
  return transitions((style, id) => (
    <a.div className="item" style={style}>
      <TodoItem id={id} remove={remove} />
    </a.div>
  ));
};

const TodoList = () => {
  const [, setTodos] = useAtom(todosAtom);
  const remove = (id: string) => {
    setTodos((prev) => prev.filter((item) => item !== id));
    todoAtomFamily.remove({ id });
  };

  const add = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const title = e.currentTarget.inputTitle.value;
    const id = nanoid();
    todoAtomFamily({ id, title });
    setTodos((prev) => [...prev, id]);
  };
  return (
    <form onSubmit={add}>
      <input name="inputTitle" placeholder="Type ..." />
      <Filtered remove={remove} />
    </form>
  );
};

export default function App() {
  return (
    <Provider>
      <h1>Jotai Todo</h1>
      <TodoList />
    </Provider>
  );
}
