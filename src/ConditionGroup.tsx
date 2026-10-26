import { Group, ListChecks, Trash } from "lucide-react";
import { useQueryDispatch } from "./QueryContext";
import type { GroupNode } from "./queryReducer";
import RuleOptions from "./RuleOptions";
import type { Combinator } from "./types";

interface ConditionGroupProps {
  group: GroupNode;
  isRoot?: boolean;
  canRemove?: boolean;
}

export default function ConditionGroup({
  group,
  isRoot = false,
  canRemove = false,
}: ConditionGroupProps) {
  const dispatch = useQueryDispatch();
  // A group can't be emptied, so its only child can't be removed
  const canRemoveChild = group.children.length > 1;
  // Rules are numbered within their own group, skipping nested groups
  let ruleCount = 0;

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
              onClick={() => dispatch({ type: "remove", id: group.id })}
            >
              <Trash size={16} />
            </button>
          )}
        </div>
      </div>
      {/* role="list" because Safari drops list semantics once list-style
          is removed, which Tailwind's preflight does */}
      <ul role="list" className="mt-4 flex flex-col gap-4">
        {group.children.map((child) => (
          <li key={child.id}>
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
              <ConditionGroup group={child} canRemove={canRemoveChild} />
            )}
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
