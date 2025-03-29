import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Eye, Download, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useToastStore } from '../../components/Toast';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface SimulationResultRecord {
  id: string;
  model_id: string;
  results: any[];
  created_at: string;
  game_models: {
    name: string;
    type: string;
    config: {
      players: Array<{
        id: number;
        name: string;
      }>;
    };
  };
}

export const AdminResults: React.FC = () => {
  const [results, setResults] = useState<SimulationResultRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<SimulationResultRecord | null>(null);
  const { addToast } = useToastStore();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from('simulation_results')
        .select(`
          *,
          game_models (
            name,
            type,
            config
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('获取仿真结果失败:', error);
      addToast({
        type: 'error',
        message: '获取仿真结果失败',
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个仿真结果吗？')) return;

    try {
      const { error } = await supabase
        .from('simulation_results')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setResults(results.filter(result => result.id !== id));
      if (selectedResult?.id === id) {
        setSelectedResult(null);
      }
      addToast({
        type: 'success',
        message: '删除成功',
        duration: 3000
      });
    } catch (error) {
      console.error('删除仿真结果失败:', error);
      addToast({
        type: 'error',
        message: '删除失败',
        duration: 3000
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/[/]/g, '');
  };

  const convertToCSV = (result: SimulationResultRecord) => {
    const players = result.game_models.config.players;
    
    // CSV header
    let csv = '回合,';
    players.forEach(player => {
      csv += `${player.name}策略,${player.name}收益,`;
    });
    csv = csv.slice(0, -1) + '\n';

    // CSV data rows
    result.results.forEach(round => {
      csv += `${round.step + 1},`;
      players.forEach(player => {
        csv += `${round.playerChoices[player.id]},${round.payoffs[player.id]},`;
      });
      csv = csv.slice(0, -1) + '\n';
    });

    return csv;
  };

  const handleExport = (result: SimulationResultRecord) => {
    try {
      // Generate filename with model name, type and timestamp
      const timestamp = formatDate(result.created_at);
      const filename = `${result.game_models.name}_${timestamp}`;

      // Export as CSV
      const csvContent = convertToCSV(result);
      const csvBlob = new Blob(['\ufeff' + csvContent], { // Add BOM for Excel
        type: 'text/csv;charset=utf-8'
      });
      const csvUrl = URL.createObjectURL(csvBlob);
      const link = document.createElement('a');
      link.href = csvUrl;
      link.download = `${filename}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(csvUrl);

      // Also export JSON for data preservation
      const jsonContent = JSON.stringify(result.results, null, 2);
      const jsonBlob = new Blob([jsonContent], {
        type: 'application/json'
      });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      const jsonLink = document.createElement('a');
      jsonLink.href = jsonUrl;
      jsonLink.download = `${filename}.json`;
      document.body.appendChild(jsonLink);
      jsonLink.click();
      document.body.removeChild(jsonLink);
      URL.revokeObjectURL(jsonUrl);

      addToast({
        type: 'success',
        message: '导出成功',
        duration: 3000
      });
    } catch (error) {
      console.error('导出失败:', error);
      addToast({
        type: 'error',
        message: '导出失败',
        duration: 3000
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">仿真结果管理</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  模型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  仿真时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((result) => (
                <tr key={result.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {result.game_models.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {result.game_models.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(result.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      onClick={() => setSelectedResult(result)}
                      title="查看详情"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="text-green-600 hover:text-green-900 mr-4"
                      onClick={() => handleExport(result)}
                      title="导出数据"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDelete(result.id)}
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedResult && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              {selectedResult.game_models.name} - 仿真结果详情
            </h3>
            <button
              onClick={() => setSelectedResult(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              关闭
            </button>
          </div>

          <div className="overflow-x-auto">
            <LineChart
              width={800}
              height={400}
              data={selectedResult.results}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="step" />
              <YAxis />
              <Tooltip />
              <Legend />
              {/* 修改部分：移除未使用的 index 参数 */}
              {Object.keys(selectedResult.results[0]?.payoffs || {}).map((playerId) => (
                <Line
                  key={playerId}
                  type="monotone"
                  dataKey={`payoffs.${playerId}`}
                  name={`玩家${playerId}收益`}
                  stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
                />
              ))}
            </LineChart>
          </div>

          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">原始数据</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">回合</th>
                    {selectedResult.game_models.config.players.map(player => (
                      <React.Fragment key={player.id}>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          {player.name}策略
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          {player.name}收益
                        </th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedResult.results.map((round, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 text-sm text-gray-900">{round.step + 1}</td>
                      {selectedResult.game_models.config.players.map(player => (
                        <React.Fragment key={player.id}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {round.playerChoices[player.id]}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {round.payoffs[player.id]}
                          </td>
                        </React.Fragment>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
