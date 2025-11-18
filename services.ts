import { GoogleGenAI, Type } from "@google/genai";
import { ProductGroup, Subscription, Plan, User, Product, ProductSpecification } from './types';

// Gemini API Service
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = (file: File) => {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("Failed to read file as base64 string."));
      }
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};


export const generateProductDetails = async (imageFile: File, userPrompt: string) => {
  const imagePart = await fileToGenerativePart(imageFile);
  const fullPrompt = `Based on the following image and user instructions, generate a compelling product title and description for an e-commerce marketplace. The tone should be professional and enticing.
  User Instructions: "${userPrompt}"`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ parts: [imagePart, { text: fullPrompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "A short, catchy, and SEO-friendly product title.",
          },
          description: {
            type: Type.STRING,
            description: "A detailed product description, formatted with paragraphs and bullet points for readability. Highlight key features and benefits.",
          },
        },
        required: ["title", "description"],
      },
    },
  });

  try {
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as { title: string; description: string };
  } catch (e) {
    console.error("Error parsing Gemini response:", e);
    throw new Error("Failed to generate product details. The AI returned an invalid format.");
  }
};

export const extractProductDetailsFromText = async (productUrl: string) => {
  const prompt = `You are an advanced AI e-commerce assistant acting as a web scraper. You will be given a product URL.
Your task is to analyze this URL and, using your vast knowledge of the web and e-commerce product structures, infer the complete details of the product as if you had visited the page.

You MUST provide a comprehensive and plausible set of data for the product found at the URL. The data must be relevant for e-commerce in Brazil.

URL: "${productUrl}"

Based on your analysis of the URL, extract or generate the following information:
1.  **title**: A compelling and SEO-friendly product title.
2.  **category**: A plausible product category path (e.g., "Casa e Cozinha/Panelas/Frigideiras").
3.  **description**: A detailed and well-formatted product description. Use paragraphs and bullet points to highlight key features and benefits.
4.  **specifications**: A JSON object with plausible technical details like weight, dimensions, NCM, EAN, and SKU. If you cannot determine a value, provide a realistic placeholder.

Return all this information in a single JSON object.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "A plausible product title based on the context." },
          category: { type: Type.STRING, description: "A likely product category path." },
          description: { type: Type.STRING, description: "A detailed product description, formatted with paragraphs and bullet points." },
          specifications: {
            type: Type.OBJECT,
            properties: {
              weight_kg: { type: Type.NUMBER, description: "Plausible weight in kilograms." },
              dimensions_cm: { type: Type.STRING, description: "Plausible dimensions H x W x D in cm. e.g., '25 x 15 x 10'" },
              ncm: { type: Type.STRING, description: "A plausible NCM code for Brazil." },
              ean: { type: Type.STRING, description: "A plausible EAN barcode number." },
              sku: { type: Type.STRING, description: "A plausible SKU." },
            },
            required: ["weight_kg", "dimensions_cm", "ncm", "ean", "sku"]
          },
        },
        required: ["title", "category", "description", "specifications"],
      },
    },
  });

  try {
    const jsonText = response.text.trim();
    type ExtractionResponse = {
        title: string;
        category: string;
        description: string;
        specifications: ProductSpecification;
    };
    return JSON.parse(jsonText) as ExtractionResponse;
  } catch (e) {
    console.error("Error parsing Gemini extraction response:", e);
    throw new Error("Failed to extract product details. The AI returned an invalid format.");
  }
};


// --- Real Bling API Integration ---

const BLING_API_BASE_URL_FOR_PROXY = 'https://api.bling.com.br/Api/v3'; // Used in backend proxy example
const BLING_AUTH_URL = 'https://www.bling.com.br/Api/v3/oauth/authorize';

const PRODUCT_GROUPS_STORAGE_KEY = 'productgen_product_groups';
const BLING_CREDS_STORAGE_KEY = 'productgen_bling_creds';
const BLING_AUTH_STORAGE_KEY = 'productgen_bling_auth_real';

interface BlingAuthData {
    access_token: string;
    refresh_token: string;
    expires_in: number; // seconds
    token_type: string;
    scope: string;
    linkedAt: string; // ISO string of when the token was fetched
}

// --- Bling API Helpers (Refactored for Backend Proxy) ---

const _handleBlingApiError = async (response: Response) => {
    const responseBody = await response.json().catch(() => ({}));
    console.error("Bling API Error:", responseBody);
    const errorDetails = responseBody.error?.message || responseBody.error?.description || `Erro HTTP ${response.status}`;
    let userMessage = `Erro na API do Bling: ${errorDetails}.`;
    if (responseBody.error?.fields) {
        const fieldErrors = responseBody.error.fields.map((f: any) => `${f.element}: ${f.message}`).join(', ');
        userMessage += ` Detalhes: ${fieldErrors}`;
    }
    throw new Error(userMessage);
};

// This function calls our own backend proxy, not Bling directly.
const _exchangeBlingCode = async (code: string): Promise<Omit<BlingAuthData, 'linkedAt'>> => {
    console.log('➡️ Enviando código de autorização para o backend...');
    // This endpoint must be created on your server. See backend example below.
    const response = await fetch('/api/bling/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Verifique se o seu servidor proxy está rodando e configurado corretamente.' }));
        throw new Error(`Falha na comunicação com o backend: ${err.message || response.statusText}`);
    }
    const authData = await response.json();
    console.log('✅ Código trocado com sucesso pelo backend!');
    return authData;
};

// This function calls our own backend proxy for refreshing the token.
const _refreshBlingToken = async (refreshToken: string): Promise<Omit<BlingAuthData, 'linkedAt'>> => {
    console.log('🔄 Solicitando renovação de token ao backend...');
    // This endpoint must be created on your server. See backend example below.
    const response = await fetch('/api/bling/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Verifique se o seu servidor proxy está rodando.' }));
        apiService.unlinkBling(); // Clear invalid tokens
        throw new Error(`Falha ao renovar token via backend: ${err.message || response.statusText}`);
    }
    const newAuthData = await response.json();
    console.log('✅ Token renovado com sucesso pelo backend!');
    return newAuthData;
};


const _getBlingAuth = (): BlingAuthData | null => {
    const authData = localStorage.getItem(BLING_AUTH_STORAGE_KEY);
    return authData ? JSON.parse(authData) : null;
};

const _setBlingAuth = (authData: Omit<BlingAuthData, 'linkedAt'>) => {
    const fullAuthData: BlingAuthData = {
        ...authData,
        linkedAt: new Date().toISOString(),
    };
    localStorage.setItem(BLING_AUTH_STORAGE_KEY, JSON.stringify(fullAuthData));
    return fullAuthData;
};

const _refreshAccessToken = async (): Promise<BlingAuthData> => {
    const auth = _getBlingAuth();
    if (!auth?.refresh_token) {
        throw new Error('Refresh token não encontrado. Por favor, reconecte-se ao Bling.');
    }
    const newAuthData = await _refreshBlingToken(auth.refresh_token);
    return _setBlingAuth(newAuthData);
};


const _verificarERenovarToken = async (): Promise<string> => {
    const auth = _getBlingAuth();
    if (!auth) {
        throw new Error("Não conectado ao Bling. Por favor, autorize a aplicação nas Configurações.");
    }

    const linkedAt = new Date(auth.linkedAt);
    const expiresIn = auth.expires_in || 3600;
    const expiresAt = new Date(linkedAt.getTime() + expiresIn * 1000);
    const now = new Date();
    const minutesToExpire = (expiresAt.getTime() - now.getTime()) / (1000 * 60);

    console.log(`⏰ Token do Bling expira em: ${minutesToExpire.toFixed(0)} minutos`);

    if (minutesToExpire < 10) {
        const newAuth = await _refreshAccessToken();
        return newAuth.access_token;
    }
    return auth.access_token;
};


const _validarProdutoParaBling = (product: Product): ProductSpecification => {
    console.log(`\n📋 Validando dados do produto: "${product.title}"`);
    const dados = { ...product.specifications };

    let ncm = String(dados.ncm || '').replace(/[^0-9]/g, '');
    if (!ncm || ncm.length !== 8) {
        console.warn(`  ⚠️ NCM inválido "${dados.ncm}", usando padrão 96151100`);
        dados.ncm = '96151100';
    }

    const dims = (dados.dimensions_cm || "20 x 15 x 10").split('x').map(d => parseFloat(d.trim()));
    let altura = dims[0] || 20;
    let largura = dims[1] || 15;
    let profundidade = dims[2] || 10;
    
    if (largura <= 0) { largura = 15; }
    if (altura <= 0) { altura = 20; }
    if (profundidade <= 0) { profundidade = 10; }
    
    let pesoLiquido = Number(dados.weight_kg) || 0.3;
    if (pesoLiquido <= 0) { pesoLiquido = 0.3; }
    
    const sanitizedSpecs: ProductSpecification = {
        ...dados,
        ncm: ncm,
        weight_kg: pesoLiquido,
        dimensions_cm: `${altura} x ${largura} x ${profundidade}`
    };

    console.log(`  ✅ Validação OK`);
    return sanitizedSpecs;
};

const _obterOuCriarCategoria = async (fullCategory: string, accessToken: string): Promise<{ id: string }> => {
    console.log(`\n📂 Processando categoria: "${fullCategory}"`);
    const parts = fullCategory.split('/').map(p => p.trim()).filter(Boolean);
    if (parts.length === 0) return { id: '9999' }; // Default category if empty

    const response = await fetch(`${BLING_API_BASE_URL_FOR_PROXY}/categorias/produtos`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!response.ok) await _handleBlingApiError(response);
    const { data: categoriasExistentes } = await response.json();
    
    let parentId = null;
    let finalCategoryId = null;

    for (const part of parts) {
        const existing = categoriasExistentes.find(
            (c: any) => c.descricao.toLowerCase() === part.toLowerCase() && c.categoriaPai?.id == parentId
        );
        
        if (existing) {
            parentId = existing.id;
            finalCategoryId = existing.id;
        } else {
            const payload: any = { descricao: part };
            if (parentId) {
                payload.categoriaPai = { id: parentId };
            }
            const createResponse = await fetch(`${BLING_API_BASE_URL_FOR_PROXY}/categorias/produtos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (!createResponse.ok) await _handleBlingApiError(createResponse);
            const { data: newCategory } = await createResponse.json();
            parentId = newCategory.id;
            finalCategoryId = newCategory.id;
            categoriasExistentes.push({ ...newCategory, categoriaPai: {id: payload.categoriaPai?.id} });
        }
    }
    
    return { id: finalCategoryId! };
};

// --- Mocked Services (Non-Bling) ---
const _simulatedDelay = <T,>(data: T, delay = 500): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), delay));

const mockSubscription: Subscription = { planId: 'pro', planName: 'Pro Plan', status: 'active', credits: 85, periodEnd: '2023-11-25' };
const mockPlans: Plan[] = [
    { id: 'free', name: 'Free', price: 0, credits: 10, features: ['10 Credits/month', 'Basic Support'] },
    { id: 'pro', name: 'Pro', price: 29, credits: 100, features: ['100 Credits/month', 'Bling Integration', 'Priority Support'] },
    { id: 'enterprise', name: 'Enterprise', price: 99, credits: 500, features: ['500 Credits/month', 'Stripe Integration', 'Dedicated Support'] },
];
const mockUsers: User[] = [
    {id: 'usr_123', name: 'Alice', email: 'alice@example.com', role: 'user'},
    {id: 'usr_456', name: 'Bob', email: 'bob@example.com', role: 'user'},
];


export const apiService = {
  getProductGroups: (): Promise<ProductGroup[]> => {
    const data = localStorage.getItem(PRODUCT_GROUPS_STORAGE_KEY);
    return _simulatedDelay(data ? JSON.parse(data) : [], 300);
  },
  saveProductGroups: (groups: ProductGroup[]): Promise<void> => {
    localStorage.setItem(PRODUCT_GROUPS_STORAGE_KEY, JSON.stringify(groups));
    return Promise.resolve();
  },
  // --- Bling Integration (Frontend Logic) ---
  saveBlingCredentials: (clientId: string, clientSecret: string): Promise<void> => {
    // Note: clientSecret is saved here to be available for the backend proxy example,
    // but in a real app, it should ONLY be stored on the server as an environment variable.
    const creds = { clientId, clientSecret };
    localStorage.setItem(BLING_CREDS_STORAGE_KEY, JSON.stringify(creds));
    localStorage.removeItem(BLING_AUTH_STORAGE_KEY);
    return Promise.resolve();
  },
  getBlingCredentials: (): Promise<{ clientId: string, clientSecret: string } | null> => {
    const creds = localStorage.getItem(BLING_CREDS_STORAGE_KEY);
    return Promise.resolve(creds ? JSON.parse(creds) : null);
  },
  getBlingAuthStatus: (): Promise<{ isLinked: boolean }> => {
    return Promise.resolve({ isLinked: !!_getBlingAuth() });
  },
  redirectToBlingAuth: () => {
    const creds = JSON.parse(localStorage.getItem(BLING_CREDS_STORAGE_KEY) || '{}');
    if (!creds.clientId) {
      throw new Error("Client ID do Bling não configurado.");
    }
    const redirectUri = `${window.location.origin}/bling-callback.html`;
    const state = `st_${Date.now()}`; // Security state
    localStorage.setItem('bling_oauth_state', state);

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: creds.clientId,
        redirect_uri: redirectUri,
        state: state,
    });
    window.location.href = `${BLING_AUTH_URL}?${params.toString()}`;
  },
  handleBlingCallback: async (code: string, state: string): Promise<{ success: boolean }> => {
    const storedState = localStorage.getItem('bling_oauth_state');
    if (state !== storedState) {
        throw new Error("Estado de OAuth inválido. Tentativa de CSRF?");
    }
    localStorage.removeItem('bling_oauth_state');

    // The secure part is now handled by our backend proxy.
    const authData = await _exchangeBlingCode(code);
    _setBlingAuth(authData);
    return { success: true };
  },
  unlinkBling: (): Promise<void> => {
    localStorage.removeItem(BLING_AUTH_STORAGE_KEY);
    return Promise.resolve();
  },
  exportToBling: async (group: ProductGroup): Promise<{ success: boolean }> => {
    console.log(`🚀 INICIANDO EXPORTAÇÃO REAL PARA O BLING: ${group.name}`);
    const accessToken = await _verificarERenovarToken();
    const blingApiUrl = `${BLING_API_BASE_URL_FOR_PROXY}/produtos`;

    // 1. Create Parent Product
    const parentPayload = {
        nome: group.name.substring(0, 120),
        codigo: group.products[0]?.sku.split('-')[0] || `GRP-${Date.now()}`,
        formato: 'V', tipo: 'P', situacao: 'A'
    };
    const parentResponse = await fetch(blingApiUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(parentPayload)
    });
    if (!parentResponse.ok) await _handleBlingApiError(parentResponse);
    const { data: parentProduct } = await parentResponse.json();

    // 2. Process each variation
    for (const variation of group.products) {
        const sanitizedSpecs = _validarProdutoParaBling(variation);
        const category = await _obterOuCriarCategoria(variation.category || "Geral", accessToken);
        const dims = sanitizedSpecs.dimensions_cm.split('x').map(d => parseFloat(d.trim()));
        const payload = {
            nome: variation.title.substring(0, 120),
            codigo: variation.sku,
            preco: variation.price || 99.90,
            tipo: 'P', situacao: 'A', formato: 'S',
            descricao: variation.description,
            unidade: 'UN',
            pesoLiquido: sanitizedSpecs.weight_kg,
            pesoBruto: sanitizedSpecs.weight_kg * 1.15,
            dimensoes: { largura: dims[1], altura: dims[0], profundidade: dims[2], unidadeMedida: 'cm' },
            tributacao: { origem: 0, ncm: sanitizedSpecs.ncm },
            categoria: { id: category.id },
            produtoPai: { id: parentProduct.id },
            midia: { imagens: { imagensURL: [{ link: group.baseImageUrl }] } }
        };

        const variationResponse = await fetch(blingApiUrl, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!variationResponse.ok) await _handleBlingApiError(variationResponse);
    }
    return { success: true };
  },
  getSubscription: () => _simulatedDelay(mockSubscription),
  getPlans: () => _simulatedDelay(mockPlans),
  getUsers: () => _simulatedDelay(mockUsers, 800),
  consumeCredits: (amount: number) => {
    mockSubscription.credits -= amount;
    return _simulatedDelay({ success: true, newCreditCount: mockSubscription.credits });
  },
};
