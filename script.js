let bmiHistory = JSON.parse(localStorage.getItem("bmiHistory")) || [];
let chart = null;

function calculateBMI() {
  const name = document.getElementById("name").value;
  const gender = document.getElementById("gender").value;
  const age = document.getElementById("age").value;
  const dob = document.getElementById("dob").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const height = parseFloat(document.getElementById("height").value) / 100;
  const weight = parseFloat(document.getElementById("weight").value);
  const result = document.getElementById("result");

  if (!name || !gender || !age || !dob || !email || !phone || !height || !weight) {
    result.innerHTML = "Please fill in all fields.";
    result.className = "result";
    return;
  }

  const bmi = (weight / (height * height)).toFixed(2);
  let status = "", cssClass = "", precautions = "";

  if (bmi < 18.5) {
    status = "Underweight";
    cssClass = "underweight";
    precautions = `<strong>Precautions for Underweight (${gender}):</strong>
      <ul>
        <li>Eat more nutrient-dense meals.</li>
        <li>Include protein and strength training.</li>
      </ul>`;
  } else if (bmi < 24.9) {
    status = "Normal weight";
    cssClass = "normal";
    precautions = `<strong>Healthy Tips for ${gender}:</strong>
      <ul>
        <li>Maintain balanced diet and active lifestyle.</li>
        <li>Keep regular sleep and stress management routines.</li>
      </ul>`;
  } else if (bmi < 29.9) {
    status = "Overweight";
    cssClass = "overweight";
    precautions = `<strong>Precautions for Overweight (${gender}):</strong>
      <ul>
        <li>Control calories and stay active.</li>
        <li>Monitor processed food intake.</li>
      </ul>`;
  } else {
    status = "Obese";
    cssClass = "obese";
    precautions = `<strong>Precautions for Obesity (${gender}):</strong>
      <ul>
        <li>Seek professional health advice.</li>
        <li>Focus on long-term healthy habits.</li>
      </ul>`;
  }

  const now = new Date().toLocaleString();
  const bmiEntry = {
    name, gender, age, dob, email, phone, bmi: parseFloat(bmi), status, timestamp: now,
  };

  bmiHistory.push(bmiEntry);
  localStorage.setItem("bmiHistory", JSON.stringify(bmiHistory));
  updateChart();

  result.className = `result ${cssClass}`;
  result.innerHTML = `
    <strong>${name}</strong> (${gender})<br>
    Age: ${age}<br>
    DOB: ${dob}<br>
    Email: ${email}<br>
    Phone: ${phone}<br>
    Your BMI is <strong>${bmi}</strong> (${status})<br>
    Calculated on: ${now}<br>
    ${precautions}
  `;
}

function updateChart() {
  const labels = bmiHistory.map(entry => entry.timestamp);
  const values = bmiHistory.map(entry => entry.bmi);

  const ctx = document.getElementById("bmiChart").getContext("2d");

  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.update();
  } else {
    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "BMI History",
          data: values,
          borderColor: "#0072ff",
          backgroundColor: "rgba(0,114,255,0.1)",
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const latest = bmiHistory[bmiHistory.length - 1];

  if (!latest) {
    alert("Please calculate BMI first.");
    return;
  }

  doc.setFontSize(18);
  doc.text("BMI Report", 20, 20);

  doc.setFontSize(12);
  doc.text(`Name: ${latest.name}`, 20, 35);
  doc.text(`Gender: ${latest.gender}`, 20, 42);
  doc.text(`Age: ${latest.age}`, 20, 49);
  doc.text(`DOB: ${latest.dob}`, 20, 56);
  doc.text(`Email: ${latest.email}`, 20, 63);
  doc.text(`Phone: ${latest.phone}`, 20, 70);
  doc.text(`BMI: ${latest.bmi} (${latest.status})`, 20, 77);
  doc.text(`Date: ${latest.timestamp}`, 20, 84);

  doc.setFontSize(14);
  doc.text("History:", 20, 100);
  let y = 110;

  bmiHistory.forEach((entry, i) => {
    doc.setFontSize(10);
    doc.text(`${i + 1}. ${entry.timestamp} - ${entry.bmi}`, 20, y);
    y += 6;
  });

  const filename = `${latest.name.replace(/\s+/g, "_")}_BMI_Report.pdf`;
  doc.save(filename);
}

function exportCSV() {
  if (bmiHistory.length === 0) {
    alert("No data to export.");
    return;
  }

  const csvRows = [
    ["Name", "Gender", "Age", "DOB", "Email", "Phone", "BMI", "Status", "Date/Time"]
  ];

  bmiHistory.forEach(entry => {
    csvRows.push([
      entry.name,
      entry.gender,
      entry.age,
      entry.dob,
      entry.email,
      entry.phone,
      entry.bmi,
      entry.status,
      entry.timestamp
    ]);
  });

  const csvContent = csvRows.map(row => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "BMI_History.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function resetHistory() {
  if (confirm("Are you sure you want to clear all history?")) {
    localStorage.removeItem("bmiHistory");
    bmiHistory = [];
    document.getElementById("result").innerHTML = "";
    document.getElementById("result").className = "result";
    if (chart) {
      chart.destroy();
      chart = null;
    }
    updateChart();
  }
}

// 🌙 Dark mode toggle
document.getElementById("toggle-theme").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const themeIcon = document.getElementById("toggle-theme");
  themeIcon.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// Auto age from DOB
document.getElementById("dob").addEventListener("change", function () {
  const dob = new Date(this.value);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  document.getElementById("age").value = age;
});

window.addEventListener("load", updateChart);
