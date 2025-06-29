"use client";
import React, { useState } from "react";

export interface Rule {
  id: string;
  type: string;
  worker?: string;
  client?: string;
  task?: string;
  description?: string;
}

interface RulesManagerProps {
  workers?: string[];
  clients?: string[];
  tasks?: string[];
  rules: Rule[];
  onRulesChange: (rules: Rule[]) => void;
}

const ruleTypes = [
  { value: "no_worker_on_task", label: "No worker on task" },
  { value: "no_worker_for_client", label: "No worker for client" },
  { value: "max_tasks_per_worker", label: "Max tasks per worker" },
  // Add more rule types as needed
];

const RulesManager: React.FC<RulesManagerProps> = ({ workers = [], clients = [], tasks = [], rules, onRulesChange }) => {
  const [newRule, setNewRule] = useState<Partial<Rule>>({ type: ruleTypes[0].value });

  const handleAddRule = () => {
    if (!newRule.type) return;
    const rule: Rule = {
      id: Date.now().toString(),
      type: newRule.type!,
      worker: newRule.worker || '',
      client: newRule.client || '',
      task: newRule.task || '',
      description: newRule.description || '',
    };
    onRulesChange([...rules, rule]);
    setNewRule({ type: ruleTypes[0].value });
  };

  const handleDeleteRule = (id: string) => {
    onRulesChange(rules.filter(r => r.id !== id));
  };

  return (
    <div className="w-full max-w-2xl bg-gray-50 dark:bg-gray-900 rounded p-4 mt-4 text-xs">
      <div className="mb-2 font-semibold">Business Rules</div>
      <div className="flex flex-col gap-2 mb-4">
        <select
          value={newRule.type}
          onChange={e => setNewRule({ ...newRule, type: e.target.value })}
          className="border rounded p-1"
        >
          {ruleTypes.map(rt => (
            <option key={rt.value} value={rt.value}>{rt.label}</option>
          ))}
        </select>
        {newRule.type === 'no_worker_on_task' && (
          <>
            <input
              placeholder="Worker name or ID"
              value={newRule.worker || ''}
              onChange={e => setNewRule({ ...newRule, worker: e.target.value })}
              className="border rounded p-1"
            />
            <input
              placeholder="Task name or ID"
              value={newRule.task || ''}
              onChange={e => setNewRule({ ...newRule, task: e.target.value })}
              className="border rounded p-1"
            />
          </>
        )}
        {newRule.type === 'no_worker_for_client' && (
          <>
            <input
              placeholder="Worker name or ID"
              value={newRule.worker || ''}
              onChange={e => setNewRule({ ...newRule, worker: e.target.value })}
              className="border rounded p-1"
            />
            <input
              placeholder="Client name or ID"
              value={newRule.client || ''}
              onChange={e => setNewRule({ ...newRule, client: e.target.value })}
              className="border rounded p-1"
            />
          </>
        )}
        {newRule.type === 'max_tasks_per_worker' && (
          <>
            <input
              placeholder="Worker name or ID"
              value={newRule.worker || ''}
              onChange={e => setNewRule({ ...newRule, worker: e.target.value })}
              className="border rounded p-1"
            />
            <input
              placeholder="Max tasks"
              type="number"
              value={newRule.description || ''}
              onChange={e => setNewRule({ ...newRule, description: e.target.value })}
              className="border rounded p-1"
            />
          </>
        )}
        <button
          onClick={handleAddRule}
          className="bg-blue-500 text-white rounded px-3 py-1 mt-2 hover:bg-blue-600"
        >
          Add Rule
        </button>
      </div>
      <div>
        <div className="font-semibold mb-1">Current Rules:</div>
        <ul className="list-disc pl-5">
          {rules.map(rule => (
            <li key={rule.id} className="flex items-center justify-between mb-1">
              <span>
                {ruleTypes.find(rt => rt.value === rule.type)?.label}:
                {rule.worker && ` Worker: ${rule.worker}`}
                {rule.client && ` Client: ${rule.client}`}
                {rule.task && ` Task: ${rule.task}`}
                {rule.description && ` (${rule.description})`}
              </span>
              <button
                onClick={() => handleDeleteRule(rule.id)}
                className="ml-2 text-red-500 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RulesManager; 