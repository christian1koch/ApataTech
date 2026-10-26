import { Group, ListChecks, Trash } from "lucide-react";
import { useQueryDispatch } from "./QueryContext";
import type { GroupNode } from "./queryReducer";
import RuleOptions from "./RuleOptions";
import type { Combinator } from "./types";

interface ConditionGroupProps {
  group: GroupNode;
  depth?: number;
  canRemove?: boolean;
}

export default function ConditionGroup({
  group,
  depth = 0,
  canRemove = false,
}: ConditionGroupProps) {
  const dispatch = useQueryDispatch();
  const isRoot = depth === 0;
  // A group can't be emptied, so its only child can't be removed
  const canRemoveChild = group.children.length > 1;
  // Rules are numbered within their own group, skipping nested groups
  let ruleCount = 0;

  return (
    <fieldset
      className={`fieldset rounded-box border-base-300 border p-3 sm:p-4 ${
        depth % 2 === 1 ? "bg-base-200" : "bg-base-100"
      }`}
    >
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
            type="button"
            className="btn max-sm:btn-square"
            onClick={() => dispatch({ type: "addRule", groupId: group.id })}
          >
            <ListChecks size={16} />
            <span className="max-sm:sr-only">Add Rule</span>
          </button>
          <button
            type="button"
            className="btn max-sm:btn-square"
            onClick={() => dispatch({ type: "addGroup", groupId: group.id })}
          >
            <Group size={16} />
            <span className="max-sm:sr-only">Add Group</span>
          </button>
          {!isRoot && (
            <button
              type="button"
              className="btn btn-ghost btn-square enabled:text-error"
              aria-label="Remove group"
              disabled={!canRemove}
              onClick={() => dispatch({ type: "remove", id: group.id })}
            >
              <Trash size={16} />
            </button>
          )}
        </div>
      </div>
      <ul role="list" className="mt-3 flex flex-col gap-2">
        {group.children.map((child) => (
          // Rules get their bottom spacing from the reserved hint line (h-4);
          // groups have none, so they get the same as a margin
          <li
            key={child.id}
            className={child.kind === "group" ? "mb-4" : undefined}
          >
            {child.kind === "rule" ? (
              <RuleOptions
                label={`Rule ${++ruleCount}`}
                rule={child.rule}
                canRemove={canRemoveChild}
                onChange={(rule) =>
                  dispatch({ type: "updateRule", id: child.id, rule })
                }
                onRemove={() => dispatch({ type: "remove", id: child.id })}
              />
            ) : (
              <ConditionGroup
                group={child}
                depth={depth + 1}
                canRemove={canRemoveChild}
              />
            )}
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
