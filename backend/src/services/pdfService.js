import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

const width = 800;
const height = 400;
const chartCallback = (ChartJS) => {
  ChartJS.defaults.responsive = true;
  ChartJS.defaults.maintainAspectRatio = false;
};

export const generateChartImage = async (type, data, options = {}) => {
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, chartCallback });

  const configuration = {
    type,
    data,
    options: {
      ...options,
      plugins: {
        legend: {
          labels: {
            color: '#ffffff',
          },
        },
      },
      scales: type !== 'pie' ? {
        y: {
          ticks: { color: '#ffffff' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
        },
        x: {
          ticks: { color: '#ffffff' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
        },
      } : undefined,
    },
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
};

export const generatePDFReport = async (analyticsData, user) => {
  const PDFDocument = (await import('pdfkit')).default;
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50
  });

  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  return new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageHeight = doc.page.height;
    doc.fontSize(24).text('Analytics Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.text(`Generated for: ${user.name} (${user.email})`, { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(18).text('Overview', { underline: true });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Total Tickets: ${analyticsData.overview.totalTickets}`);
    doc.text(`Open Tickets: ${analyticsData.overview.openTickets}`);
    doc.text(`Closed Tickets: ${analyticsData.overview.closedTickets}`);
    doc.text(`Average Response Time: ${analyticsData.overview.avgResponseTime} minutes`);
    doc.text(`Average Resolution Time: ${analyticsData.overview.avgResolutionTime} hours`);
    doc.moveDown(2);
    doc.fontSize(18).text('Priority Breakdown', { underline: true });
    doc.moveDown();
    doc.fontSize(12);
    Object.entries(analyticsData.priorityBreakdown).forEach(([priority, count]) => {
      const percentage = analyticsData.overview.totalTickets > 0
        ? ((count / analyticsData.overview.totalTickets) * 100).toFixed(1)
        : 0;
      doc.text(`${priority}: ${count} (${percentage}%)`);
    });
    doc.moveDown(2);
    doc.fontSize(18).text('Status Breakdown', { underline: true });
    doc.moveDown();
    doc.fontSize(12);
    Object.entries(analyticsData.statusBreakdown).forEach(([status, count]) => {
      doc.text(`${status}: ${count}`);
    });
    doc.moveDown(2);
    if (analyticsData.agentPerformance && analyticsData.agentPerformance.length > 0) {
      if (doc.y > pageHeight - 200) {
        doc.addPage();
      }

      doc.fontSize(18).text('Agent Performance', { underline: true });
      doc.moveDown();
      doc.fontSize(10);

      analyticsData.agentPerformance.forEach((agent) => {
        if (doc.y > pageHeight - 100) {
          doc.addPage();
        }

        doc.text(`${agent.name}:`);
        doc.text(`  - Assigned: ${agent.totalAssigned}`);
        doc.text(`  - Resolved: ${agent.resolved}`);
        doc.text(`  - Pending: ${agent.pending}`);
        doc.text(`  - Avg Resolution: ${Math.round(agent.avgResolutionTime / (1000 * 60 * 60))}h`);
        doc.moveDown();
      });
    }

    doc.end();
  });
};
