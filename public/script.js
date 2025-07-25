async function analyzeSEO() 
{
  const url = document.getElementById("urlInput").value.trim();
  const resultsDiv = document.getElementById("results");

  if (!url) 
  {
    resultsDiv.innerHTML = "<p style='color:red;'>Please enter a valid URL.</p>";
    return;
  }

  resultsDiv.innerHTML = "<p>Analyzing SEO...</p>";

  try 
  {
    const res = await fetch(`/analyze?url=${encodeURIComponent(url)}`);
    const data = await res.json();

    const {
      title,
      metaDescription,
      h1Tags,
      canonical,
      robots,
      imageAltRatio,
      totalImages,
      imagesWithAlt,
    } = data;

    let score = 0;
    if (title.length >= 30 && title.length <= 65) score += 20;
    if (metaDescription.length >= 100 && metaDescription.length <= 160) score += 20;
    if (h1Tags === 1) score += 20;
    if (imageAltRatio >= 80) score += 20;
    if (canonical !== "Not Found") score += 10;
    if (robots.toLowerCase().includes("index")) score += 10;

    resultsDiv.innerHTML = `
      <h3>SEO Report for ${url}</h3>
      <ul>
        <li><strong>Title:</strong> ${title}</li>
        <li><strong>Meta Description:</strong> ${metaDescription}</li>
        <li><strong>H1 Tags:</strong> ${h1Tags}</li>
        <li><strong>Images with ALT:</strong> ${imageAltRatio}% (${imagesWithAlt}/${totalImages})</li>
        <li><strong>Canonical:</strong> ${canonical}</li>
        <li><strong>Robots:</strong> ${robots}</li>
      </ul>
      <h2>🔵 SEO Score: ${score}/100</h2>
    `;
  } 
  catch (err) 
  {
    resultsDiv.innerHTML = "<p style='color:red;'>Failed to analyze. Please try a different URL.</p>";
  }
}

const nodemailer = require("nodemailer");

app.use(express.json());

app.post("/send-email", async (req, res) => {
  const { email, reportHtml } = req.body;

  if (!email || !reportHtml) {
    return res.status(400).json({ error: "Missing email or report data" });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "your_email@gmail.com",
      pass: "your_email_password_or_app_password"
    }
  });

  try 
  {
    await transporter.sendMail({
      from: '"SEO Analyzer Tool" <your_email@gmail.com>',
      to: email,
      subject: "Your SEO Audit Report",
      html: reportHtml
    });

    res.json({ success: true });
  } 
  catch (error) 
  {
    console.error("Mail error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

let chartInstance = null;

function renderScoreChart(score) 
{
  const canvas = document.getElementById("seoChart");
  canvas.style.display = "block";

  const ctx = canvas.getContext("2d");

  if (chartInstance) 
  {
    chartInstance.destroy(); // Re-render on re-analyze
  }

  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["SEO Score", "Remaining"],
      datasets: [{
        data: [score, 100 - score],
        backgroundColor: ["#1e90ff", "#f0f0f0"],
        borderWidth: 1
      }]
    },
    options: {
      cutout: "70%",
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
        title: {
          display: true,
          text: `${score}/100`,
          font: { size: 24 }
        }
      }
    }
  });
}

async function sendEmail() 
{
  const email = document.getElementById("emailInput").value.trim();
  const resultsDiv = document.getElementById("results");

  if (!email || !resultsDiv.innerHTML.trim()) 
  {
    alert("Enter email and run analysis first.");
    return;
  }

  try 
  {
    const res = await fetch("/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        reportHtml: resultsDiv.innerHTML
      })
    });

    const data = await res.json();
    if (data.success) 
    {
      alert("📧 SEO report sent successfully!");
    } 
    else 
    {
      alert("❌ Failed to send report.");
    }
  } 
  catch (err) 
  {
    console.error(err);
    alert("Error sending email.");
  }
}

async function downloadPDF() 
{
  const results = document.getElementById("results");
  if (!results.innerText.trim()) 
  {
    alert("Please run an analysis first.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let lines = results.innerText.split("\n");
  let y = 10;
  lines.forEach(line => {
    if (y > 280) 
    {
      doc.addPage();
      y = 10;
    }
    doc.text(line, 10, y);
    y += 10;
  });

  doc.save("seo-report.pdf");
}

    const 
    {
      title,
      metaDescription,
      h1Tags,
      canonical,
      robotsMeta,
      imageAltRatio,
      totalImages,
      imagesWithAlt,
      robotsTxt,
      hasSitemap
    } = data;

    let score = 0;
    if (title.length >= 30 && title.length <= 65) score += 20;
    if (metaDescription.length >= 100 && metaDescription.length <= 160) score += 20;
    if (h1Tags === 1) score += 20;
    if (imageAltRatio >= 80) score += 20;
    if (canonical !== "Not Found") score += 10;
    if (robotsMeta.toLowerCase().includes("index")) score += 5;
    if (hasSitemap === "Yes") score += 5;

    resultsDiv.innerHTML = `
      <h3>SEO Report for ${url}</h3>
      <ul>
        <li><strong>Title:</strong> ${title}</li>
        <li><strong>Meta Description:</strong> ${metaDescription}</li>
        <li><strong>H1 Tags:</strong> ${h1Tags}</li>
        <li><strong>Images with ALT:</strong> ${imageAltRatio}% (${imagesWithAlt}/${totalImages})</li>
        <li><strong>Canonical:</strong> ${canonical}</li>
        <li><strong>Meta Robots:</strong> ${robotsMeta}</li>
        <li><strong>Sitemap.xml:</strong> ${hasSitemap}</li>
        <li><strong>robots.txt Content:</strong><br><pre>${robotsTxt.substring(0, 500)}</pre></li>
      </ul>
      <h2>🔵 SEO Score: ${score}/100</h2>
      renderScoreChart(score);
      saveAudit(email, resultsDiv.innerHTML, score);
    `;

async function saveAudit(email, html, score) 
{
  if (!email) return;
  try 
  {
    await fetch("/save-audit", 
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, reportHtml: html, score })
    });
  } 
  catch (err) 
  {
    console.error("Save failed:", err);
  }
}

async function saveAudit(email, html, score) 
{
  if (!email) return;
  try 
  {
    await fetch("/save-audit", 
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, reportHtml: html, score })
    });
  } 
  catch (err) 
  {
    console.error("Save failed:", err);
  }
}

async function loadHistory() 
{
  const email = document.getElementById("historyEmail").value.trim();
  const historyDiv = document.getElementById("auditHistory");

  try 
  {
    const res = await fetch(`/get-audits?email=${encodeURIComponent(email)}`);
    const audits = await res.json();

    if (!audits.length) 
    {
      historyDiv.innerHTML = "<p>No reports found.</p>";
      return;
    }

    historyDiv.innerHTML = audits.map(audit => `
      <div style="border:1px solid #ccc; padding:10px; margin:10px 0;">
        <strong>Date:</strong> ${new Date(audit.date).toLocaleString()}<br>
        <strong>Score:</strong> ${audit.score}/100
        <div>${audit.reportHtml}</div>
      </div>
    `).join("");
  } 
  catch (err) 
  {
    console.error(err);
    historyDiv.innerHTML = "<p>Error loading history.</p>";
  }
}
