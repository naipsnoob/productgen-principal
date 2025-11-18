
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth';
import { apiService, generateProductDetails, extractProductDetailsFromText, fileToBase64 } from './services';
import { Card, Button } from './components';
import { Product, ProductGroup, Subscription, Plan, User, ProductSpecification } from './types';
import { useNavigate, useLocation } from 'react-router-dom';

const LoadingSpinner = () => (
    <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
);

// --- Icons for Feature Section ---
const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);
const MagicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);
const ExportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);

// --- Icons for Generate Product Page ---
const UploadManualIcon = ({className = "w-5 h-5"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
);
const SiteFornecedorIcon = ({className = "w-6 h-6"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
);
const InfoIcon = ({className = "w-5 h-5"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);
const ExtractDataIcon = ({className="w-5 h-5"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
        <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
    </svg>
);
const TuneIcon = ({className="w-8 h-8"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
    </svg>
);
const ImageIcon = ({className = "w-8 h-8"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
);
const SparklesIcon = ({className="w-5 h-5"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10.868 2.884c.321-.772 1.433-.772 1.754 0l2.092 5.047a.75.75 0 00.694.493l5.523.802c.84.122.997 1.131.393 1.636l-3.995 3.895a.75.75 0 00-.217.79l.94 5.501c.152.885-.734 1.558-1.558 1.14l-4.93-2.592a.75.75 0 00-.702 0l-4.93 2.592c-.823.418-1.71-.255-1.558-1.14l.94-5.501a.75.75 0 00-.217-.79L.282 10.862c-.604-.505-.447-1.514.393-1.636l5.523-.802a.75.75 0 00.694-.493L10.868 2.884z" clipRule="evenodd" />
    </svg>
);
const FolderIcon = ({className = "w-4 h-4"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 16 16" fill="currentColor">
        <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h2.146a1.5 1.5 0 0 1 1.06.44l.854.853A.5.5 0 0 0 8 3.5h4.5A1.5 1.5 0 0 1 14 5v1.5a.5.5 0 0 1-1 0V5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 1-.354-.146L6.293 3.5H3.5a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V10a.5.5 0 0 1 1 0v3A1.5 1.5 0 0 1 12.5 14.5h-9A1.5 1.5 0 0 1 2 13V3.5Z" />
    </svg>
);

const GridIcon = ({className = "w-4 h-4"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 16 16" fill="currentColor" >
        <path d="M1 2.75A1.75 1.75 0 0 1 2.75 1h10.5A1.75 1.75 0 0 1 15 2.75v10.5A1.75 1.75 0 0 1 13.25 15H2.75A1.75 1.75 0 0 1 1 13.25V2.75ZM6 3v2.5h4V3H6Zm4 3.5H6v4h4v-4ZM6 13v-2.5h4V13H6ZM3 6h2.5V3H3v3Zm0 1v4h2.5V7H3Zm0 5h2.5v-2.5H3V12Zm7.5 1H13v-3h-2.5v3Zm0-4H13V7h-2.5v2.5Z" />
    </svg>
);


export const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const exampleProducts = [
        { title: 'Tênis de Corrida', description: 'Leveza e conforto para o seu dia a dia.', image: 'https://picsum.photos/seed/shoes/500/500' },
        { title: 'Cadeira Gamer Ergonômica', description: 'Máximo conforto para longas sessões de jogos.', image: 'https://picsum.photos/seed/chair/500/500' },
        { title: 'Fone de Ouvido Bluetooth', description: 'Som imersivo e sem ruídos.', image: 'https://picsum.photos/seed/headphones/500/500' },
        { title: 'Smartwatch', description: 'Monitore sua saúde e conecte-se ao seu mundo.', image: 'https://picsum.photos/seed/watch/500/500' },
    ];

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative text-center py-20 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary-50 to-white z-0"></div>
                <div className="relative z-10">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">Crie produtos para o seu marketplace com o poder da IA</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Gere títulos, descrições, traduza, remova fundos e muito mais. Integre com Bling e automatize seu fluxo de trabalho.
                    </p>
                    <Button 
                        onClick={() => navigate('/pricing')} 
                        className="text-lg px-8 py-4 transform hover:scale-105 transition-transform duration-300 ease-in-out shadow-lg bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
                    >
                        Começar Agora
                    </Button>
                    <div className="mt-16 max-w-6xl mx-auto px-4">
                        <img 
                            src="https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1331&auto=format&fit=crop" 
                            alt="Dashboard do ProductGen mostrando a interface de criação de produtos com IA" 
                            className="rounded-xl shadow-2xl ring-1 ring-gray-900/10" 
                        />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-4">Como funciona?</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">Transforme suas ideias em produtos de sucesso em apenas alguns cliques.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="flex flex-col items-center">
                            <UploadIcon />
                            <h3 className="text-2xl font-bold mb-2">1. Faça o upload</h3>
                            <p className="text-gray-600">Envie suas imagens de produtos ou extraia tudo direto da sua conta Bling com a nossa integração.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <MagicIcon />
                            <h3 className="text-2xl font-bold mb-2">2. IA Mágica</h3>
                            <p className="text-gray-600">Nossa inteligência artificial cria títulos, descrições e otimiza suas imagens para vender mais.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <ExportIcon />
                            <h3 className="text-2xl font-bold mb-2">3. Exporte e Venda</h3>
                            <p className="text-gray-600">Exporte os produtos para sua loja virtual ou envie diretamente para o Bling, prontos para vender.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Use Cases Section */}
            <section className="py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-4">O que você pode criar?</h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">De roupas a eletrônicos, nossa IA é treinada para criar descrições atraentes para qualquer tipo de produto.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {exampleProducts.map((product, index) => (
                            <div key={index} className="bg-white border rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
                                <img src={product.image} alt={product.title} className="w-full h-56 object-cover" />
                                <div className="p-6">
                                    <h4 className="text-xl font-bold mb-2">{product.title}</h4>
                                    <p className="text-gray-600">{product.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-20 bg-primary-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-4">Pronto para começar?</h2>
                    <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">Acelere sua criação de produtos e venda mais.</p>
                    <Button onClick={() => navigate('/pricing')} className="text-lg bg-white text-primary-600 hover:bg-gray-100 px-8 py-3">
                        Criar minha conta
                    </Button>
                </div>
            </section>
        </div>
    );
};

export const PricingPage: React.FC = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        apiService.getPlans().then(setPlans);
    }, []);

    const handleSelectPlan = (planId: string) => {
        // Here you would integrate with Stripe Checkout.
        // For this mock, we'll just navigate to a success page.
        console.log(`Plan ${planId} selected`);
        navigate('/purchase-success');
    };

    if (plans.length === 0) return <LoadingSpinner />;

    return (
        <div className="py-12">
            <h1 className="text-4xl font-bold text-center mb-2">Planos Flexíveis</h1>
            <p className="text-lg text-center text-gray-600 mb-10">Escolha o plano que melhor se adapta às suas necessidades.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {plans.map(plan => (
                    <Card key={plan.id} className={`flex flex-col ${plan.name === 'Pro' ? 'border-2 border-primary-500 transform scale-105' : ''}`}>
                        <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                        <p className="text-4xl font-extrabold mb-4">${plan.price}<span className="text-lg font-normal text-gray-500">/mês</span></p>
                        <p className="text-gray-600 mb-6">{plan.credits} créditos por mês</p>
                        <ul className="space-y-2 mb-8 flex-grow">
                            {plan.features.map(feature => (
                                <li key={feature} className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <Button onClick={() => handleSelectPlan(plan.id)} className="w-full mt-auto">
                            {plan.name === 'Pro' ? 'Plano Mais Popular' : 'Selecionar Plano'}
                        </Button>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export const PurchaseSuccessPage: React.FC = () => {
   const navigate = useNavigate();
   return (
        <div className="text-center py-16">
            <h1 className="text-4xl font-bold text-green-600 mb-4">Compra Realizada com Sucesso!</h1>
            <p className="text-lg text-gray-700">Uma conta foi criada para você. Verifique seu e-mail para as credenciais de acesso.</p>
            <Button onClick={() => navigate('/login')} className="mt-8">Ir para o Login</Button>
        </div>
    );
};

export const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            login(email);
            navigate('/dashboard');
        }
    };

    return (
        <div className="flex justify-center items-center py-12">
            <Card className="w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="seu@email.com"
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full">Entrar</Button>
                </form>
            </Card>
        </div>
    );
};

export const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Bem-vindo, {user?.name}!</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <h3 className="text-lg font-semibold">Produtos Gerados</h3>
                    <p className="text-4xl font-bold">12</p>
                </Card>
                <Card>
                    <h3 className="text-lg font-semibold">Créditos Restantes</h3>
                    <p className="text-4xl font-bold text-green-600">85</p>
                </Card>
                <Card>
                    <h3 className="text-lg font-semibold">Plano Atual</h3>
                    <p className="text-4xl font-bold text-primary-600">Pro</p>
                </Card>
            </div>
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Ações Rápidas</h2>
                <div className="flex gap-4">
                    <Button onClick={() => navigate('/generate')}>Gerar Novo Produto</Button>
                    <Button onClick={() => navigate('/products')}>Ver Meus Produtos</Button>
                </div>
            </div>
        </div>
    );
};

export const GenerateProductPage: React.FC = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState<'supplier' | 'manual'>('supplier');

    // State for manual mode
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [prompt, setPrompt] = useState('');
    const [generatedContent, setGeneratedContent] = useState<{ title: string; description: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);

    // State for supplier mode
    const [supplierUrl, setSupplierUrl] = useState('https://c7drop.com.br/produto/frigideira-antiaderente-inducao-3-em-1-ovo-hamburguer-3-partes-marqs-home/');
    const [groupName, setGroupName] = useState('');
    const [variationCount, setVariationCount] = useState<number | string>(10);
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [extractedSpecs, setExtractedSpecs] = useState<ProductSpecification | null>(null);
    const [targetMarketplace, setTargetMarketplace] = useState('all');
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractionError, setExtractionError] = useState<string | null>(null);
    const [extractionSuccess, setExtractionSuccess] = useState<string | null>(null);
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);


    useEffect(() => {
        apiService.getSubscription().then(setSubscription);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setUploadedImages(Array.from(e.target.files));
        }
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile || !prompt || (subscription && subscription.credits < 1)) {
            setError('Por favor, adicione uma imagem, um prompt e tenha créditos suficientes.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedContent(null);

        try {
            const result = await generateProductDetails(imageFile, prompt);
            setGeneratedContent(result);
            await apiService.consumeCredits(1);
            setSubscription(prev => prev ? {...prev, credits: prev.credits - 1} : null);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExtractData = async () => {
        if (!supplierUrl) {
            setExtractionError('Por favor, insira uma URL.');
            return;
        }
        setIsExtracting(true);
        setExtractionError(null);
        setExtractionSuccess(null);
        try {
            const result = await extractProductDetailsFromText(supplierUrl);
            setGroupName(result.title);
            setCategory(result.category);
            setDescription(result.description);
            setExtractedSpecs(result.specifications)
            setExtractionSuccess(`Dados extraídos para "${result.title}"! Os detalhes foram preenchidos abaixo.`);
            console.log("Extracted specifications:", result.specifications);
        } catch (err) {
            setExtractionError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido na extração.');
        } finally {
            setIsExtracting(false);
        }
    };
    
    const handleSupplierSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (uploadedImages.length === 0 || !groupName) {
            alert("Por favor, importe pelo menos uma imagem e defina um nome para o grupo.");
            setIsLoading(false);
            return;
        }

        try {
            const base64Image = await fileToBase64(uploadedImages[0]);
            const existingGroups = await apiService.getProductGroups();
            const count = typeof variationCount === 'string' ? parseInt(variationCount, 10) : variationCount;
            const now = new Date().toISOString();
            const products: Product[] = [];

            for (let i = 1; i <= count; i++) {
                const skuSafeGroupName = groupName.replace(/\s+/g, '-').toUpperCase();
                products.push({
                    id: `${now}-prod-${i}`,
                    title: `${groupName} - Variação #${i}`,
                    description: description,
                    createdAt: now,
                    sku: `${skuSafeGroupName}-${String(i).padStart(3, '0')}`,
                    category: category,
                    specifications: extractedSpecs ?? undefined,
                    price: 99.90, // Example price
                });
            }

            const newGroup: ProductGroup = {
                id: now,
                name: groupName,
                baseImageUrl: base64Image,
                products: products,
                createdAt: now,
            };

            await apiService.saveProductGroups([...existingGroups, newGroup]);
            navigate('/products');

        } catch (err) {
            console.error("Failed to generate products", err);
            alert("Ocorreu um erro ao gerar os produtos.");
        } finally {
            setIsLoading(false);
        }
    };

    type TabButtonProps = {
        isActive: boolean;
        onClick: () => void;
        children: React.ReactNode;
    };
    const TabButton = ({ isActive, onClick, children }: TabButtonProps) => (
        <button
            onClick={onClick}
            type="button"
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 w-48
            ${isActive
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg scale-105'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
        >
            {children}
        </button>
    );
    
    const renderSupplierMode = () => (
      <form onSubmit={handleSupplierSubmit} className="space-y-8">
        <Card className="!p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
              <SiteFornecedorIcon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Extrair de Site de Fornecedor</h2>
              <p className="text-gray-500">IA extrai todos os dados técnicos</p>
            </div>
          </div>

            {extractionSuccess ? (
                <div className="p-4 mb-6 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                    {extractionSuccess}
                </div>
            ) : (
                <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-4 mb-6 text-sm text-blue-800 space-y-2">
                    <div className="flex items-center font-semibold">
                        <InfoIcon className="w-5 h-5 mr-2 text-blue-500" />
                        Como funciona:
                    </div>
                    <ol className="list-decimal list-inside pl-2 space-y-1 text-gray-700">
                        <li>Cole o link do produto no site do fornecedor.</li>
                        <li>Clique em "Extrair Dados" para a IA preencher as informações.</li>
                        <li>Na seção "Imagens do Produto", clique para importar as fotos.</li>
                        <li>Personalize os detalhes e gere seus produtos.</li>
                    </ol>
                </div>
            )}

          <div>
              <label htmlFor="supplier-url" className="block text-sm font-medium text-gray-700 mb-1">
                  Cole o link do produto do fornecedor
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                 <input 
                      type="url" 
                      id="supplier-url"
                      value={supplierUrl} 
                      onChange={(e) => setSupplierUrl(e.target.value)}
                      className="flex-grow block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                 <button 
                    type="button" 
                    onClick={handleExtractData}
                    disabled={isExtracting}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-100/50 border border-primary-200/50 rounded-md hover:bg-primary-100 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-wait sm:w-36"
                 >
                    {isExtracting ? (
                         <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                            Extraindo...
                         </>
                     ) : (
                         <>
                            <ExtractDataIcon />
                            Extrair Dados
                         </>
                     )}
                 </button>
              </div>
              {extractionError && <p className="mt-2 text-sm text-red-600">{extractionError}</p>}
          </div>

          <div className="flex items-center gap-2 bg-blue-50/50 text-blue-800/80 text-xs p-3 mt-3 rounded-lg">
              <SparklesIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <span>A IA irá extrair: título, descrição completa, peso, dimensões, NCM, EAN, SKU e mais</span>
          </div>
        </Card>

        <Card className="!p-8">
            <div className="flex items-center gap-4 mb-6">
                <div className="bg-gray-100 text-gray-600 p-3 rounded-xl">
                    <ImageIcon className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Imagens do Produto</h2>
                    <p className="text-gray-500">Faça o upload das imagens para gerar os anúncios.</p>
                </div>
            </div>
            <div className="space-y-4">
                <label htmlFor="image-upload" className="w-full cursor-pointer bg-primary-50/50 border-2 border-dashed border-primary-200/80 rounded-lg flex flex-col items-center justify-center p-8 text-center text-primary-700 hover:bg-primary-100 transition-colors">
                    <UploadIcon />
                    <span className="font-semibold mt-2">Clique para importar imagens</span>
                    <span className="text-xs text-gray-500 mt-1">Selecione múltiplas imagens de uma vez</span>
                </label>
                <input 
                    id="image-upload" 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden"
                    onChange={handleImageUpload}
                />
                
                {uploadedImages.length > 0 && (
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">{uploadedImages.length} imagem(ns) selecionada(s):</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                            {uploadedImages.map((file, index) => (
                                <div key={index} className="relative">
                                    <img 
                                        src={URL.createObjectURL(file)} 
                                        alt={`Pré-visualização ${index + 1}`} 
                                        className="w-full h-24 object-cover rounded-md shadow-sm border border-gray-200"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Card>
        
        <Card className="!p-8">
            <div className="flex items-center gap-4 mb-6">
                <div className="bg-gray-100 text-gray-600 p-3 rounded-xl">
                    <TuneIcon className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Configurações</h2>
                    <p className="text-gray-500">Personalize a geração de produtos</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label htmlFor="group-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nome do Grupo/Lote <span className="text-red-500">*</span>
                    </label>
                    <input 
                        type="text" 
                        id="group-name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Ex: Tênis Nike Air Max Branco"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        required
                    />
                     <p className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500">
                        <FolderIcon /> Nome para organizar este lote de produtos
                    </p>
                </div>

                <div>
                    <label htmlFor="variation-count" className="block text-sm font-medium text-gray-700 mb-1">
                        Quantidade de Variações
                    </label>
                    <input 
                        type="number" 
                        id="variation-count"
                        value={variationCount}
                        onChange={(e) => setVariationCount(e.target.value)}
                        min="1"
                        max="100"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    <p className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500">
                        <GridIcon /> De 1 até 100 anúncios diferentes
                    </p>
                </div>

                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        Categoria (opcional)
                    </label>
                    <input 
                        type="text" 
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Ex: Eletrônicos, Moda, Casa..."
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    <p className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500">
                        <FolderIcon /> A categoria é extraída do fornecedor e mapeada para Bling
                    </p>
                </div>
                
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição do Produto
                    </label>
                    <textarea 
                        id="description"
                        rows={8}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="A descrição do produto gerada pela IA aparecerá aqui..."
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    <p className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500">
                        <SparklesIcon className="w-4 h-4" /> A descrição é gerada pela IA e pode ser editada.
                    </p>
                </div>


                 <div>
                    <label htmlFor="target-marketplace" className="block text-sm font-medium text-gray-700 mb-1">
                        Marketplace Alvo
                    </label>
                    <select
                        id="target-marketplace"
                        value={targetMarketplace}
                        onChange={(e) => setTargetMarketplace(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="all">Todos os Marketplaces</option>
                        <option value="mercado_livre">Mercado Livre</option>
                        <option value="amazon">Amazon</option>
                        <option value="magazine_luiza">Magazine Luiza</option>
                    </select>
                </div>
            </div>
        </Card>
        
        <Button type="submit" className="w-full !text-lg !py-4 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600" disabled={isLoading}>
             {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Gerando...
                </div>
            ) : 'Gerar Produtos'}
        </Button>
      </form>
    );

    const renderManualMode = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
                <form onSubmit={handleManualSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">1. Upload da Imagem do Produto</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    {imageFile ? (
                                        <img src={URL.createObjectURL(imageFile)} alt="Preview" className="mx-auto h-32 w-auto object-cover rounded"/>
                                    ) : (
                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    )}
                                    <div className="flex text-sm text-gray-600">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                                            <span>Carregar um arquivo</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                                        </label>
                                        <p className="pl-1">ou arraste e solte</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF até 10MB</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">2. Descreva o que você quer</label>
                            <textarea
                                id="prompt"
                                rows={4}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                placeholder="Ex: Crie um título e descrição para uma camiseta de algodão com esta estampa. Destaque o conforto e a durabilidade."
                            ></textarea>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Gerando...' : 'Gerar com IA'}
                        </Button>
                    </div>
                </form>
            </Card>
            <Card>
                <h2 className="text-2xl font-bold mb-4">Resultado</h2>
                {isLoading && <LoadingSpinner />}
                {error && <div className="text-red-600 bg-red-100 p-3 rounded-md">{error}</div>}
                {generatedContent && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Título</label>
                            <input type="text" readOnly value={generatedContent.title} className="mt-1 block w-full bg-gray-100 px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Descrição</label>
                            <textarea readOnly value={generatedContent.description} rows={10} className="mt-1 block w-full bg-gray-100 px-3 py-2 border border-gray-300 rounded-md shadow-sm whitespace-pre-wrap"></textarea>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center p-1 bg-gray-100 rounded-xl mb-8 w-max mx-auto">
                <TabButton isActive={mode === 'manual'} onClick={() => setMode('manual')}>
                    <UploadManualIcon />
                    Upload Manual
                </TabButton>
                <TabButton isActive={mode === 'supplier'} onClick={() => setMode('supplier')}>
                    <SiteFornecedorIcon />
                    Site Fornecedor
                </TabButton>
            </div>
            
            {mode === 'supplier' ? renderSupplierMode() : renderManualMode()}
        </div>
    );
};

const BlingIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M215.1 40.9a12 12 0 0 0-12 0l-72 41.5a12 12 0 0 0-6 10.4v83a12 12 0 0 0 6 10.4l72 41.5a12 12 0 0 0 12 0l72-41.5a12 12 0 0 0 6-10.4v-83a12 12 0 0 0-6-10.4Zm-5.1 161.4-66 38.1v-76.2l66-38.1Zm6-10.4v-65.8L154 88.1l65.8 38.1v65.7ZM131.1 27.8a12 12 0 0 0-12.1 0L47.1 69.4a12 12 0 0 0-6 10.4v83a12 12 0 0 0 6 10.4l72 41.5a12 12 0 0 0 12 0l72-41.5a12 12 0 0 0 6-10.4v-18a12 12 0 0 0-24 0v12.2l-60 34.6v-76.2l60-34.7V92a12 12 0 0 0 24 0V58.6a12 12 0 0 0-6-10.4Zm-78 161.4-66-38.1v-76.2l66 38.1Z"/>
    </svg>
);

const ChevronDownIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);


const ProductGroupCard: React.FC<{ group: ProductGroup }> = ({ group }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);

    const handleExport = async () => {
        setIsExporting(true);
        setExportSuccess(false);
        setExportError(null);
        try {
            await apiService.exportToBling(group);
            setExportSuccess(true);
            setTimeout(() => setExportSuccess(false), 4000); // Reset after 4s
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Falha ao exportar para o Bling.";
            setExportError(errorMessage);
            // We show the error inline now, but an alert can be good for immediate feedback too.
            // alert(errorMessage); 
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Card className="!p-0 overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6">
                <img src={group.baseImageUrl} alt={group.name} className="w-32 h-32 object-cover rounded-lg flex-shrink-0 border" />
                <div className="flex-grow text-center sm:text-left">
                    <h2 className="text-xl font-bold mb-1 text-gray-800">{group.name}</h2>
                    <p className="text-sm text-gray-500">
                        {new Date(group.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                        <GridIcon className="w-4 h-4" />
                        {group.products.length} Variações
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 self-stretch sm:self-center">
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        Ver Variações
                        <ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    <button 
                        onClick={handleExport}
                        disabled={isExporting || exportSuccess}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                    >
                        {isExporting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Exportando...
                            </>
                        ) : exportSuccess ? (
                            <>
                                <BlingIcon />
                                Exportado!
                            </>
                        ) : (
                            <>
                                <BlingIcon />
                                Exportar para o Bling
                            </>
                        )}
                    </button>
                </div>
            </div>
            
            {exportError && (
                 <div className="bg-red-50 border-t border-red-200 text-red-800 text-sm p-4 mx-6 mb-6 rounded">
                    <p className="font-bold">Erro na Exportação</p>
                    <p>{exportError}</p>
                 </div>
            )}

            {isExpanded && (
                <div className="bg-gray-50/70 p-6 border-t">
                    <h3 className="font-semibold mb-3 text-gray-700">Variações Geradas:</h3>
                    <div className="max-h-60 overflow-y-auto pr-2">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2">Título da Variação</th>
                                    <th className="px-4 py-2">SKU</th>
                                </tr>
                            </thead>
                            <tbody>
                                {group.products.map(product => (
                                    <tr key={product.id} className="border-b bg-white hover:bg-gray-50">
                                        <td className="px-4 py-2 font-medium text-gray-800">{product.title}</td>
                                        <td className="px-4 py-2 text-gray-600 font-mono">{product.sku}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </Card>
    );
};

export const ProductsPage: React.FC = () => {
    const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setIsLoading(true);
        apiService.getProductGroups()
            .then(data => {
                // Sort by most recent first
                data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setProductGroups(data);
            })
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Meus Produtos</h1>
                <Button onClick={() => navigate('/generate')}>Gerar Novo Produto</Button>
            </div>
            
            {isLoading ? (
                <LoadingSpinner />
            ) : productGroups.length > 0 ? (
                 <div className="space-y-6">
                    {productGroups.map(group => (
                       <ProductGroupCard key={group.id} group={group} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-xl font-medium text-gray-900">Nenhum produto gerado</h3>
                    <p className="mt-1 text-sm text-gray-500">Comece a criar seu primeiro lote de produtos.</p>
                    <div className="mt-6">
                        <Button onClick={() => navigate('/generate')}>
                            Gerar Primeiro Produto
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};


export const SubscriptionPage: React.FC = () => {
    const [subscription, setSubscription] = useState<Subscription | null>(null);

    useEffect(() => {
        apiService.getSubscription().then(setSubscription);
    }, []);

    if (!subscription) return <LoadingSpinner />;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Minha Assinatura</h1>
            <Card className="max-w-2xl">
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold">Plano</h3>
                        <p className="text-lg text-primary-600">{subscription.planName}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Status</h3>
                        <p className={`text-lg ${subscription.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>{subscription.status}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Créditos Restantes</h3>
                        <p className="text-lg">{subscription.credits}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Data de Renovação</h3>
                        <p className="text-lg">{new Date(subscription.periodEnd).toLocaleDateString()}</p>
                    </div>
                    <div className="pt-4">
                        <Button>Gerenciar Assinatura (Stripe)</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export const SettingsPage: React.FC = () => {
    const [clientId, setClientId] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [hasCreds, setHasCreds] = useState(false);
    const [isLinked, setIsLinked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    
    const callbackUrl = `${window.location.origin}/bling-callback.html`;

    const checkStatus = useCallback(async () => {
        setIsLoading(true);
        try {
            const creds = await apiService.getBlingCredentials();
            if (creds && creds.clientId) {
                setClientId(creds.clientId);
                setClientSecret(creds.clientSecret);
                setHasCreds(true);
                const authStatus = await apiService.getBlingAuthStatus();
                setIsLinked(authStatus.isLinked);
            } else {
                setHasCreds(false);
                setIsLinked(false);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkStatus();
    }, [checkStatus]);

    const handleSaveCreds = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            await apiService.saveBlingCredentials(clientId, clientSecret);
            setSaveSuccess(true);
            await checkStatus();
            setTimeout(() => setSaveSuccess(false), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLinkBling = () => {
        try {
            apiService.redirectToBlingAuth();
        } catch (error) {
            alert(error instanceof Error ? error.message : "Erro desconhecido");
        }
    };
    
    const handleUnlinkBling = async () => {
        if(window.confirm("Tem certeza que deseja desconectar sua conta do Bling?")) {
            await apiService.unlinkBling();
            await checkStatus();
        }
    };

    const renderConnectionStatus = () => {
        if (isLinked) {
            return (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <BlingIcon className="w-6 h-6 text-green-600" />
                        <div>
                             <p className="font-semibold text-green-800">Conectado ao Bling</p>
                             <p className="text-sm text-green-700">Sua conta está vinculada e pronta para exportar.</p>
                        </div>
                    </div>
                    <button onClick={handleUnlinkBling} className="text-sm font-medium text-red-600 hover:text-red-800">Desconectar</button>
                </div>
            );
        }

        if (hasCreds && !isLinked) {
            return (
                 <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                         <BlingIcon className="w-6 h-6 text-yellow-600" />
                        <div>
                            <p className="font-semibold text-yellow-800">Ação Necessária: Autorizar</p>
                            <p className="text-sm text-yellow-700">Credenciais salvas. Agora autorize o acesso à sua conta Bling.</p>
                        </div>
                    </div>
                     <Button onClick={handleLinkBling}>
                        Autorizar no Bling
                     </Button>
                </div>
            );
        }
        return null;
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Configurações</h1>
            <Card className="max-w-3xl">
                <div className="space-y-6">
                    <div>
                         <h2 className="text-xl font-bold mb-1">Integração com Bling</h2>
                         <p className="text-sm text-gray-500">
                            Conecte sua conta Bling para exportar produtos diretamente.
                            <a href="https://ajuda.bling.com.br/hc/pt-br/articles/360043323834-Como-gerar-credenciais-para-API-do-Bling" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline ml-1">
                                Saiba mais
                            </a>
                         </p>
                    </div>
                    
                     <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-lg">
                        <p className="font-semibold text-blue-800 text-sm">
                            <InfoIcon className="inline w-5 h-5 mr-1" />
                            Configuração Obrigatória no Bling
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                            Para a integração funcionar, você <span className="font-bold">PRECISA</span> copiar a URL abaixo e colar no campo <span className="font-bold">"URL de callback"</span> nas configurações da sua API no Bling.
                        </p>
                        <input 
                            type="text" 
                            readOnly 
                            value={callbackUrl}
                            className="mt-2 w-full bg-blue-100/50 text-blue-900 text-xs p-2 border border-blue-200 rounded font-mono"
                            onFocus={(e) => e.target.select()}
                        />
                    </div>


                    {isLoading ? <LoadingSpinner/> : (
                        <>
                           {renderConnectionStatus()}
                            <form onSubmit={handleSaveCreds} className="space-y-4 pt-4 border-t mt-6">
                                <div>
                                    <label htmlFor="bling-client-id" className="block text-sm font-medium text-gray-700">Client ID</label>
                                    <input 
                                        type="password" 
                                        id="bling-client-id"
                                        value={clientId}
                                        onChange={(e) => setClientId(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" 
                                        placeholder="****************"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="bling-client-secret" className="block text-sm font-medium text-gray-700">Client Secret</label>
                                    <input 
                                        type="password" 
                                        id="bling-client-secret" 
                                        value={clientSecret}
                                        onChange={(e) => setClientSecret(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" 
                                        placeholder="****************"
                                        required
                                    />
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    <Button type="submit" disabled={isSaving}>
                                       {isSaving ? 'Salvando...' : 'Salvar Credenciais'}
                                    </Button>
                                    {saveSuccess && (
                                        <p className="text-sm text-green-600">Credenciais salvas com sucesso!</p>
                                    )}
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
};

export const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        apiService.getUsers().then(setUsers);
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Gerenciar Usuários</h1>
            <Card>
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="py-2">Nome</th>
                            <th>Email</th>
                            <th>Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="border-b">
                                <td className="py-2">{user.name}</td>
                                <td>{user.email}</td>
                                <td><span className={`px-2 py-1 text-xs rounded-full ${user.role === 'admin' ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800'}`}>{user.role}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
      <div className="text-center py-16">
        <h1 className="text-6xl font-extrabold text-primary-600">404</h1>
        <h2 className="text-3xl font-bold text-gray-800 mt-4">Página Não Encontrada</h2>
        <p className="text-lg text-gray-600 mt-2">A página que você está procurando não existe.</p>
        <Button onClick={() => navigate('/')} className="mt-8">Voltar para a Home</Button>
      </div>
  );
};