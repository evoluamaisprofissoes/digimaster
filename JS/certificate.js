// =========================================
// DigiMaster — Certificado de Conclusão PDF
// By Evolua+ Profissões
// =========================================

// Carrega jsPDF via CDN dinamicamente
function loadJsPDF(callback) {
  if (window.jspdf) { callback(); return; }
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  script.onload = callback;
  document.head.appendChild(script);
}

window.generateCertificate = function() {
  const sessions = loadSessions();
  if (!sessions.length) {
    showToast('⚠️ Complete pelo menos uma sessão para gerar o certificado!');
    return;
  }

  const userName = window.currentUser?.displayName || 
                   window.currentUser?.email?.split('@')[0] || 
                   'Aluno';
  const bestWpm  = Math.max(...sessions.map(s => s.wpm));
  const avgAcc   = Math.round(sessions.reduce((a,s) => a+s.accuracy, 0) / sessions.length);
  const totalSes = sessions.length;
  const today    = new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });

  showToast('📜 Gerando certificado...');

  loadJsPDF(() => {
    const { jsPDF } = window.jspdf;
    // A4 paisagem: 297 x 210 mm
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = 297, H = 210;

    // ---- FUNDO ----
    doc.setFillColor(8, 12, 24);
    doc.rect(0, 0, W, H, 'F');

    // ---- BORDA DUPLA ----
    // externa
    doc.setDrawColor(0, 180, 220);
    doc.setLineWidth(1.2);
    doc.rect(8, 8, W-16, H-16);
    // interna
    doc.setDrawColor(60, 80, 140);
    doc.setLineWidth(0.4);
    doc.rect(12, 12, W-24, H-24);

    // ---- CANTOS DECORATIVOS ----
    const corners = [[14,14],[W-14,14],[14,H-14],[W-14,H-14]];
    corners.forEach(([cx,cy]) => {
      doc.setDrawColor(0, 212, 255);
      doc.setLineWidth(0.8);
      const s = 10;
      const dx = cx < W/2 ? 1 : -1;
      const dy = cy < H/2 ? 1 : -1;
      doc.line(cx, cy, cx + dx*s, cy);
      doc.line(cx, cy, cx, cy + dy*s);
      // ponto central
      doc.setFillColor(0, 212, 255);
      doc.circle(cx, cy, 1.5, 'F');
    });

    // ---- FAIXAS LATERAIS ----
    doc.setFillColor(0, 212, 255, 0.05);
    // gradiente simulado: retângulo azul suave na esquerda
    for (let i = 0; i < 20; i++) {
      doc.setFillColor(0, 212, 255);
      doc.setGState(new doc.GState({ opacity: 0.008 * (20 - i) }));
      doc.rect(14, 14 + i*0.5, 40, H-28 - i, 'F');
    }
    doc.setGState(new doc.GState({ opacity: 1 }));

    // ---- LINHA DECORATIVA TOP ----
    doc.setDrawColor(0, 212, 255);
    doc.setLineWidth(0.5);
    doc.line(20, 30, W-20, 30);
    // estrelinhas na linha
    [50, 100, W/2, W-100, W-50].forEach(x => {
      doc.setFillColor(0, 212, 255);
      doc.circle(x, 30, 0.8, 'F');
    });

    // ---- LINHA DECORATIVA BOTTOM ----
    doc.line(20, H-30, W-20, H-30);
    [50, 100, W/2, W-100, W-50].forEach(x => {
      doc.setFillColor(0, 212, 255);
      doc.circle(x, H-30, 0.8, 'F');
    });

    // ---- LOGO ESCOLA (texto simulado) ----
    // Tenta carregar logo como imagem
    try {
      const canvas = document.createElement('canvas');
      const logoImg = document.getElementById('logoImg');
      if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
        canvas.width = logoImg.naturalWidth;
        canvas.height = logoImg.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(logoImg, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        doc.addImage(dataUrl, 'PNG', W/2-15, 15, 30, 12);
      }
    } catch(e) {}

    // ---- HEADER ESCOLA ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 180, 220);
    doc.text('EVOLUA+ PROFISSÕES', W/2, 34, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 130, 180);
    doc.text('Escola de Cursos Profissionalizantes · Mirassol D\'Oeste/MT · Grupo Evolua Educação', W/2, 39, { align: 'center' });

    // ---- TÍTULO CERTIFICADO ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(0, 212, 255);
    doc.text('CERTIFICADO', W/2, 58, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(100, 140, 200);
    doc.text('DE CONCLUSÃO', W/2, 66, { align: 'center' });

    // ---- LINHA SEPARADORA ----
    doc.setDrawColor(0, 212, 255);
    doc.setLineWidth(0.3);
    doc.line(W/2 - 60, 70, W/2 + 60, 70);

    // ---- TEXTO PRINCIPAL ----
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(180, 200, 230);
    doc.text('Certificamos que', W/2, 80, { align: 'center' });

    // ---- NOME DO ALUNO ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text(userName.toUpperCase(), W/2, 93, { align: 'center' });

    // sublinhado do nome
    const nameWidth = doc.getTextWidth(userName.toUpperCase());
    doc.setDrawColor(0, 212, 255);
    doc.setLineWidth(0.4);
    doc.line(W/2 - nameWidth/2, 96, W/2 + nameWidth/2, 96);

    // ---- TEXTO CORPO ----
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(160, 185, 220);
    doc.text('concluiu com êxito o programa de treinamento em', W/2, 106, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0, 212, 255);
    doc.text('DIGITAÇÃO PROFISSIONAL — DigiMaster', W/2, 115, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(140, 165, 200);
    doc.text('desenvolvendo velocidade, precisão e técnica profissional de digitação.', W/2, 123, { align: 'center' });

    // ---- MÉTRICAS ----
    const metrics = [
      { label: 'Melhor Velocidade', value: bestWpm + ' WPM', icon: '🚀' },
      { label: 'Precisão Média', value: avgAcc + '%', icon: '🎯' },
      { label: 'Sessões Concluídas', value: totalSes, icon: '📊' },
    ];
    const metW = 52, metStartX = W/2 - (metrics.length * metW)/2 + metW/2;
    metrics.forEach((m, i) => {
      const mx = metStartX + i * metW;
      const my = 138;
      // caixa
      doc.setDrawColor(0, 212, 255);
      doc.setLineWidth(0.4);
      doc.roundedRect(mx - 22, my - 8, 44, 22, 3, 3);
      // valor
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(0, 212, 255);
      doc.text(String(m.value), mx, my + 3, { align: 'center' });
      // label
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(120, 150, 190);
      doc.text(m.label, mx, my + 10, { align: 'center' });
    });

    // ---- ASSINATURA ESQUERDA (Diretor) ----
    const sigY = H - 40;
    doc.setDrawColor(80, 110, 160);
    doc.setLineWidth(0.3);
    doc.line(35, sigY, 100, sigY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(180, 200, 230);
    doc.text('Diretor(a) da Escola', 67, sigY + 5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 130, 170);
    doc.text('Evolua+ Profissões', 67, sigY + 10, { align: 'center' });

    // ---- ASSINATURA DIREITA (Coordenador) ----
    doc.line(W-100, sigY, W-35, sigY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(180, 200, 230);
    doc.text('Coordenador(a) Pedagógico(a)', W-67, sigY + 5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 130, 170);
    doc.text('Grupo Evolua Educação', W-67, sigY + 10, { align: 'center' });

    // ---- CARIMBO CENTRAL (simulado) ----
    doc.setDrawColor(0, 212, 255);
    doc.setLineWidth(0.6);
    doc.circle(W/2, sigY + 4, 12);
    doc.setDrawColor(0, 150, 200);
    doc.setLineWidth(0.3);
    doc.circle(W/2, sigY + 4, 10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5);
    doc.setTextColor(0, 212, 255);
    doc.text('EVOLUA+', W/2, sigY + 2, { align: 'center' });
    doc.text('PROFISSÕES', W/2, sigY + 6.5, { align: 'center' });

    // ---- RODAPÉ ----
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(70, 100, 140);
    doc.text(`Emitido em ${today} · DigiMaster v2.0 · digimaster-evolua.github.io`, W/2, H-16, { align: 'center' });

    // ---- SALVAR ----
    const filename = `Certificado_DigiMaster_${userName.replace(/\s+/g,'_')}.pdf`;
    doc.save(filename);
    showToast('✅ Certificado gerado com sucesso!');
    playLessonComplete && playLessonComplete();
  });
};
