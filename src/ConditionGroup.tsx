import { Group, ListChecks, Trash } from "lucide-react";
import { useEffect, useRef } from "react";
import { useQueryDispatch } from "./QueryContext";
import type { GroupNode } from "./queryReducer";
import RuleOptions from "./RuleOptions";
import type { Combinator } from "./types";

interface ConditionGroupProps {
  group: GroupNode;
  isRoot?: boolean;
  canRemove?: boolean;
  onRemove?: () => void;
}

export default function ConditionGroup({
  group,
  isRoot = false,
  canRemove = false,
  onRemove,
}: ConditionGroupProps) {
  const dispatch = useQueryDispatch();
  // A group can't be emptied, so its only child can't be removed
  const canRemoveChild = group.children.length > 1;
  // Rules are numbered within their own group, skipping nested groups
  let ruleCount = 0;

  const listRef = useRef<HTMLUListElement>(null);
  const addRuleRef = useRef<HTMLButtonElement>(null);
  // Index of the child that was just removed, so focus can be placed once the
  // list re-renders without it
  const removedIndex = useRef<number | null>(null);

  // The remove button unmounts with its child, which would drop keyboard focus
  // to the top of the page. Focus whatever slid into its place instead, or Add
  // Rule if the last child was removed.
  useEffect(() => {
    const index = removedIndex.current;
    if (index === null) return;
    removedIndex.current = null;
    const next = listRef.current?.children[index];
    const target =
      next?.querySelector<HTMLElement>("select, input, button") ??
      addRuleRef.current;
    target?.focus();
  }, [group.children]);

  const removeChild = (index: number, id: string) => {
    removedIndex.current = index;
    dispatch({ type: "remove", id });
  };

  return (
    <fieldset className="fieldset rounded-box border-base-300 border p-4">
      <legend className="fieldset-legend">{isRoot ? "Query" : "Group"}</legend>
      <div className="flex items-center gap-2">
        <select
          aria-label="Combinator"
          className="select w-24"
          value={group.combinator}
          onChange={(e) =>
            dispatch({
              type: "setCombinator",
              groupId: group.id,
              combinator: e.target.value as Combinator,
            })
          }
        >
          <option>AND</option>
          <option>OR</option>
        </select>
        <div className="ml-auto flex gap-2">
          <button
            ref={addRuleRef}
            type="button"
            className="btn"
            onClick={() => dispatch({ type: "addRule", groupId: group.id })}
          >
            <ListChecks size={16} />
            Add Rule
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => dispatch({ type: "addGroup", groupId: group.id })}
          >
            <Group size={16} />
            Add Group
          </button>
          {!isRoot && (
            <button
              type="button"
              className="btn btn-error"
              aria-label="Remove group"
              disabled={!canRemove}
              onClick={onRemove}
            >
              <Trash size={16} />
            </button>
          )}
        </div>
      </div>
      {/* role="list" because Safari drops list semantics once list-style
          is removed, which Tailwind's preflight does */}
      <ul ref={listRef} role="list" className="mt-4 flex flex-col gap-4">
        {group.children.map((child, index) => (
          <li key={child.id}>
            {child.kind === "rule" ? (
              <RuleOptions
                label={`Rule ${++ruleCount}`}
                rule={child.rule}
                canRemove={canRemoveChild}
                onChange={(rule) =>
                  dispatch({ type: "updateRule", id: child.id, rule })
                }
                onRemove={() => removeChild(index, child.id)}
              />
            ) : (
              <ConditionGroup
                group={child}
                canRemove={canRemoveChild}
                onRemove={() => removeChild(index, child.id)}
              />
            )}
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
