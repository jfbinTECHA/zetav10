export default function HelpPanel() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
      <h2 className="text-lg font-semibold mb-2">🆘 Help & Support</h2>
      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
        <li>Click on an Agent to view details.</li>
        <li>Active = currently analyzing / Idle = waiting for task.</li>
        <li>Use the dashboard to assign new workloads.</li>
        <li>
          For issues, check the logs in <code>/logs</code>.
        </li>
      </ul>
    </div>
  );
}
