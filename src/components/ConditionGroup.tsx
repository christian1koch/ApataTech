import { Group, ListChecks, Trash } from "lucide-react";
import { useQueryDispatch } from "../query/QueryContext";
import type { GroupNode, QueryNode } from "../query/queryReducer";
import RuleOptions from "./RuleOptions";
import type { Combinator } from "../query/types";

interface ConditionGroupProps {
  group: GroupNode;
  label?: string;
  depth?: number;
  canRemove?: boolean;
}

// Rules and groups are numbered separately within their parent, e.g. "Rule 2"
// and "Group 1", so assistive tech can tell siblings apart. The numbers are
// only in the accessible names: on screen they'd look like they count across
// the whole query.
function childLabels(children: QueryNode[]) {
  const counts = { rule: 0, group: 0 };
  return children.map((child) =>
    child.kind === "rule" ? `Rule ${++counts.rule}` : `Group ${++counts.group}`
  );
}

export default function ConditionGroup({
  group,
  label = "Query",
  depth = 0,
  canRemove = false,
}: ConditionGroupProps) {
  const dispatch = useQueryDispatch();
  const isRoot = depth === 0;
  // A group can't be emptied, so its only child can't be removed
  const canRemoveChild = group.children.length > 1;
  const labels = childLabels(group.children);

  return (
    <fieldset
      aria-label={label}
      className={`fieldset rounded-box border-base-300 border p-3 sm:p-4 ${
        depth % 2 === 1 ? "bg-base-200" : "bg-base-100"
      }`}
    >
      <legend className="fieldset-legend">{isRoot ? "Query" : "Group"}</legend>
      <div className="flex items-center gap-2">
        <label className="floating-label">
          <select
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
          <span>Combinator</span>
        </label>
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
              aria-label={`Remove ${label.toLowerCase()}`}
              disabled={!canRemove}
              onClick={() => dispatch({ type: "remove", id: group.id })}
            >
              <Trash size={16} />
            </button>
          )}
        </div>
      </div>
      <ul role="list" className="mt-3 flex flex-col gap-2">
        {group.children.map((child, i) => (
          // Rules get their bottom spacing from the reserved hint line (h-4);
          // groups have none, so they get the same as a margin
          <li
            key={child.id}
            className={child.kind === "group" ? "mb-4" : undefined}
          >
            {child.kind === "rule" ? (
              <RuleOptions
                label={labels[i]}
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
                label={labels[i]}
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
