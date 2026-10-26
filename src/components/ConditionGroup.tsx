import { Group, ListChecks } from "lucide-react";
import { useQueryDispatch } from "../query/QueryContext";
import type { GroupNode, QueryNode } from "../query/queryReducer";
import type { Combinator } from "../query/types";
import RemoveButton from "./RemoveButton";
import RuleOptions from "./RuleOptions";

interface ConditionGroupProps {
  group: GroupNode;
  label?: string;
  depth?: number;
  canRemove?: boolean;
}

// Numbered names like "Group 1" are only for assistive tech
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
      <GroupHeader
        group={group}
        label={label}
        isRoot={isRoot}
        canRemove={canRemove}
      />
      <ul role="list" className="mt-3 flex flex-col gap-2">
        {group.children.map((child, i) => (
          // Matches the hint line (h-4) that spaces rules
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

interface GroupHeaderProps {
  group: GroupNode;
  label: string;
  isRoot: boolean;
  canRemove: boolean;
}

function GroupHeader({ group, label, isRoot, canRemove }: GroupHeaderProps) {
  const dispatch = useQueryDispatch();

  return (
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
          <RemoveButton
            label={`Remove ${label.toLowerCase()}`}
            disabled={!canRemove}
            onClick={() => dispatch({ type: "remove", id: group.id })}
          />
        )}
      </div>
    </div>
  );
}
