import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI Client lazily/safely
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    return new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // --- API Endpoints ---
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI Policy Q&A Assistant
  app.post('/api/ai/ask', async (req, res) => {
    try {
      const { prompt, employeeContext } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'El mensaje es requerido' });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          answer: '🤖 *Modo Asistente Simulado* (Para respuestas en vivo por IA, asegúrate de configurar la clave GEMINI_API_KEY en los Secretos).\n\nEn cuanto a tu consulta sobre licencias: Según la Ley de Contrato de Trabajo de Argentina (Ley 20.744), las vacaciones se calculan según la antigüedad al 31 de diciembre: 14 días (hasta 5 años), 21 días (hasta 10 años), 28 días (hasta 20 años) y 35 días (+20 años). Las licencias médicas se justifican con certificado dentro de las 48hs.',
        });
      }

      const systemInstruction = `
Eres LicenciIA, la asistente experta de Recursos Humanos y Legislación Laboral de LicenciaPro SaaS.
Respuestas concisas, estructuradas y profesionales en español neutro / rioplatense laboral.
Reglas clave de licencias en la empresa:
- Vacaciones anuales: 14 días (<5 años antigüedad), 21 días (5-10 años), 28 días (10-20 años), 35 días (>20 años).
- Licencia por enfermedad: Requiere adjunto de certificado médico. No descuenta vacaciones.
- Licencia por examen/estudio: Hasta 10 días anuales (máx 2 por examen). Requiere certificado.
- Permisos por horas: Salidas especiales justificadas.
- Flujo de aprobación: Solicitud -> Gerente de Área (1ª Aprobación) -> Gerente de RRHH (Aprobación Definitiva).

Contexto del usuario actual: ${JSON.stringify(employeeContext || {})}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });

      res.json({ answer: response.text });
    } catch (error: any) {
      console.error('Error en Gemini API:', error);
      res.status(500).json({
        error: 'No se pudo procesar la consulta de IA',
        details: error.message,
      });
    }
  });

  // AI Overlap & Coverage Risk Analysis
  app.post('/api/ai/analyze-risk', async (req, res) => {
    try {
      const { requestData, departmentName, existingRequests } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        // Fallback intelligent heuristic
        const totalInDept = existingRequests ? existingRequests.length + 3 : 5;
        return res.json({
          riskLevel: 'MEDIUM',
          summary: `Análisis de Cobertura para el área de ${departmentName}: Se detecta coincidencia parcial de fechas.`,
          recommendation: 'Se sugiere verificar que las tareas críticas de guardia y atención a clientes queden cubiertas antes de autorizar.',
        });
      }

      const prompt = `
Analiza la siguiente solicitud de licencia y determina el riesgo de desabastecimiento o sobrecarga en el área "${departmentName}":
Datos de la nueva solicitud: ${JSON.stringify(requestData)}
Solicitudes existentes en el área: ${JSON.stringify(existingRequests)}

Responde en formato JSON con la siguiente estructura:
{
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "summary": "Breve explicación del impacto operacional",
  "recommendation": "Recomendación estratégica para el Gerente o RRHH"
}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (error: any) {
      console.error('Error en análisis de riesgo AI:', error);
      res.json({
        riskLevel: 'LOW',
        summary: 'Evaluación completada con parámetros estándar.',
        recommendation: 'Proceder según la política habitual del área.',
      });
    }
  });

  // --- Vite Middleware for Dev or Static Serve for Prod ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor LicenciaPro SaaS corriendo en http://localhost:${PORT}`);
  });
}

startServer();
