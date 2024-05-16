/* eslint-disable jsx-a11y/label-has-associated-control */
import cn from 'classnames';
import { Todo } from '../types/Todo';
import { deleteTodo, modifyTodo } from '../api/todos';
import { useState } from 'react';
import { useTodosMethods } from '../store/reducer';

interface Props {
  todo: Todo;
  isTemp?: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
}

export const TodoComponent: React.FC<Props> = ({
  todo,
  isTemp = false,
  inputRef,
}) => {
  const { deleteTodoLocal, modifyTodoLocal, setTimeoutErrorMessage } =
    useTodosMethods();

  const [loading, setLoading] = useState(false);

  const onDelete = (todoId: number) => {
    setLoading(true);

    // tries to delete on server, if success - removes locally
    deleteTodo(todoId)
      .then(() => {
        deleteTodoLocal(todo.id);
      })
      .catch(() => {
        setTimeoutErrorMessage('Unable to delete a todo');
      });

    // focuses on input field
    inputRef.current?.focus();
  };

  const onTodoStatusToggle = (modifiedTodo: Todo) => {
    setLoading(true);

    const todoProps: Partial<Todo> = modifiedTodo.completed
      ? { completed: false }
      : { completed: true };

    modifyTodo(modifiedTodo.id, todoProps)
      .then(() => {
        modifyTodoLocal(modifiedTodo.id, todoProps);
      })
      .catch(() => setTimeoutErrorMessage('Unable to update a todo'))
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div
      data-cy="Todo"
      className={cn('todo', { completed: todo.completed })}
      key={todo.id}
    >
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          onChange={() => onTodoStatusToggle(todo)}
          defaultChecked={todo.completed}
        />
      </label>

      <span data-cy="TodoTitle" className="todo__title">
        {todo.title}
      </span>

      <button
        type="button"
        className="todo__remove"
        data-cy="TodoDelete"
        onClick={() => onDelete(todo.id)}
      >
        ×
      </button>

      <div
        data-cy="TodoLoader"
        className={`modal overlay ${(isTemp || loading) && 'is-active'}`}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
