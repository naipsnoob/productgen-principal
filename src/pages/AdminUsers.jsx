import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users, Key, CheckCircle, AlertCircle, Loader2, Shield, UserCheck, UserX, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminUsersPage() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // ✅ NOVO: Estados para gerenciar dias de teste
  const [isTrialDialogOpen, setIsTrialDialogOpen] = useState(false);
  const [selectedUserForTrial, setSelectedUserForTrial] = useState(null);
  const [trialDays, setTrialDays] = useState(30);
  
  const queryClient = useQueryClient();

  // Verificar se o usuário logado é admin
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      return await base44.entities.User.list();
    },
    enabled: currentUser?.role === 'admin',
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, password }) => {
      await base44.entities.User.update(userId, {
        password: password
      });
    },
    onSuccess: () => {
      setSuccess('Senha redefinida com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
      setIsDialogOpen(false);
      setSelectedUser(null);
      
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err) => {
      setError(`Erro ao redefinir senha: ${err.message}`);
    },
  });

  // ✅ NOVO: Mutação para aprovar com dias de teste
  const aprovarComTrialMutation = useMutation({
    mutationFn: async ({ userId, dias }) => {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + dias);

      await base44.entities.User.update(userId, {
        acesso_aprovado: true,
        trial_active: true,
        trial_start_date: now.toISOString(),
        trial_end_date: endDate.toISOString(),
        trial_duration_days: dias
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSuccess(`✅ Acesso aprovado com ${trialDays} dias de teste!`);
      setIsTrialDialogOpen(false);
      setSelectedUserForTrial(null);
      setTrialDays(30);
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err) => {
      setError(`Erro ao aprovar acesso: ${err.message}`);
    },
  });

  // ✅ NOVO: Mutação para estender/reduzir período de teste
  const ajustarTrialMutation = useMutation({
    mutationFn: async ({ userId, dias }) => {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + dias);

      await base44.entities.User.update(userId, {
        trial_active: true,
        trial_start_date: now.toISOString(),
        trial_end_date: endDate.toISOString(),
        trial_duration_days: dias
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSuccess(`✅ Período de teste ajustado para ${trialDays} dias!`);
      setIsTrialDialogOpen(false);
      setSelectedUserForTrial(null);
      setTrialDays(30);
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err) => {
      setError(`Erro ao ajustar período: ${err.message}`);
    },
  });

  const revogarAcessoMutation = useMutation({
    mutationFn: async (userId) => {
      await base44.entities.User.update(userId, {
        acesso_aprovado: false,
        trial_active: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSuccess('❌ Acesso revogado. O usuário verá a tela de bloqueio.');
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err) => {
      setError(`Erro ao revogar acesso: ${err.message}`);
    },
  });

  const handleResetPassword = () => {
    setError(null);
    setSuccess(null);

    if (!newPassword || !confirmPassword) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (newPassword.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    resetPasswordMutation.mutate({
      userId: selectedUser.id,
      password: newPassword,
    });
  };

  const openResetDialog = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(null);
    setIsDialogOpen(true);
  };

  // ✅ NOVO: Abrir dialog para aprovar com dias customizados
  const openAprovarDialog = (user) => {
    setSelectedUserForTrial(user);
    setTrialDays(30); // Padrão: 30 dias
    setError(null);
    setIsTrialDialogOpen(true);
  };

  // ✅ NOVO: Abrir dialog para ajustar dias de usuário já aprovado
  const openAjustarTrialDialog = (user) => {
    setSelectedUserForTrial(user);
    setTrialDays(user.trial_duration_days || 30);
    setError(null);
    setIsTrialDialogOpen(true);
  };

  const handleAprovarComTrial = () => {
    if (!trialDays || trialDays < 1) {
      setError('Por favor, insira uma quantidade válida de dias (mínimo 1)');
      return;
    }

    aprovarComTrialMutation.mutate({
      userId: selectedUserForTrial.id,
      dias: parseInt(trialDays)
    });
  };

  const handleAjustarTrial = () => {
    if (!trialDays || trialDays < 1) {
      setError('Por favor, insira uma quantidade válida de dias (mínimo 1)');
      return;
    }

    ajustarTrialMutation.mutate({
      userId: selectedUserForTrial.id,
      dias: parseInt(trialDays)
    });
  };

  const handleRevogar = (userId) => {
    if (confirm('⚠️ Deseja REVOGAR o acesso deste usuário?\n\nEle será bloqueado e verá a tela "Aguardando Aprovação".')) {
      revogarAcessoMutation.mutate(userId);
    }
  };

  // Verificar se o usuário é admin
  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-6">
        <Card className="max-w-md shadow-xl">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-900 mb-2">
              Acesso Negado
            </h2>
            <p className="text-red-700">
              Apenas administradores podem acessar esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Separar usuários
  const usuariosPendentes = users.filter(u => u.role !== 'admin' && u.acesso_aprovado !== true);
  const usuariosAprovados = users.filter(u => u.role === 'admin' || u.acesso_aprovado === true);

  // ✅ NOVO: Calcular dias restantes
  const calcularDiasRestantes = (user) => {
    if (!user.trial_end_date) return null;
    const now = new Date();
    const endDate = new Date(user.trial_end_date);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Users className="w-10 h-10 text-blue-600" />
            Gerenciar Usuários
          </h1>
          <p className="text-slate-600 text-lg">
            Aprove usuários, defina período de teste e gerencie acessos
          </p>
        </div>

        {/* Mensagens de Sucesso/Erro */}
        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* ✅ Dialog: Aprovar/Ajustar Dias de Teste */}
        <Dialog open={isTrialDialogOpen} onOpenChange={setIsTrialDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                {selectedUserForTrial?.acesso_aprovado 
                  ? `Ajustar Período de Teste - ${selectedUserForTrial?.full_name || selectedUserForTrial?.email}`
                  : `Aprovar Acesso - ${selectedUserForTrial?.full_name || selectedUserForTrial?.email}`
                }
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="trialDays">Quantos dias de teste?</Label>
                <Input
                  id="trialDays"
                  type="number"
                  min="1"
                  max="365"
                  value={trialDays}
                  onChange={(e) => setTrialDays(parseInt(e.target.value))}
                  placeholder="Ex: 30"
                  className="mt-2"
                />
                <p className="text-xs text-slate-500 mt-1">
                  O usuário terá acesso completo por {trialDays} dia(s)
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p className="font-semibold mb-1">📅 O que vai acontecer:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Período de teste: <strong>{trialDays} dias</strong></li>
                  <li>Acesso será liberado imediatamente</li>
                  <li>Quando expirar, o acesso será <strong>revogado automaticamente</strong></li>
                  <li>Você pode estender ou reduzir o período depois</li>
                </ul>
              </div>

              <Button
                onClick={selectedUserForTrial?.acesso_aprovado ? handleAjustarTrial : handleAprovarComTrial}
                disabled={aprovarComTrialMutation.isPending || ajustarTrialMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {aprovarComTrialMutation.isPending || ajustarTrialMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {selectedUserForTrial?.acesso_aprovado ? 'Ajustar Período' : `Aprovar com ${trialDays} Dias`}
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* SEÇÃO: Usuários Pendentes */}
        {usuariosPendentes.length > 0 && (
          <Card className="shadow-lg border-yellow-300 bg-yellow-50 mb-8">
            <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-b border-yellow-300">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <AlertCircle className="w-6 h-6" />
                ⏳ Usuários Aguardando Aprovação ({usuariosPendentes.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Data de Cadastro</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuariosPendentes.map((user) => (
                      <TableRow key={user.id} className="bg-white hover:bg-yellow-50">
                        <TableCell className="font-medium">
                          {user.full_name || 'Sem nome'}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.created_date
                            ? new Date(user.created_date).toLocaleDateString('pt-BR')
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            onClick={() => openAprovarDialog(user)}
                            disabled={aprovarComTrialMutation.isPending}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Aprovar e Definir Dias
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela de Usuários Aprovados */}
        <Card className="shadow-md border-slate-200">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="text-xl font-bold text-slate-900">
              ✅ Usuários Aprovados ({usuariosAprovados.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-slate-600">Carregando usuários...</p>
              </div>
            ) : usuariosAprovados.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Nenhum usuário aprovado ainda</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Status Trial</TableHead>
                      <TableHead>Dias Restantes</TableHead>
                      <TableHead>Termina Em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuariosAprovados.map((user) => {
                      const diasRestantes = calcularDiasRestantes(user);
                      const trialExpirado = diasRestantes !== null && diasRestantes <= 0;

                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.full_name || 'Sem nome'}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                user.role === 'admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }
                            >
                              {user.role === 'admin' ? 'Admin' : 'Usuário'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.role === 'admin' ? (
                              <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
                            ) : trialExpirado ? (
                              <Badge className="bg-red-100 text-red-800">❌ Expirado</Badge>
                            ) : user.trial_active ? (
                              <Badge className="bg-green-100 text-green-800">✅ Ativo</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">Sem Trial</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.role === 'admin' ? (
                              '-'
                            ) : diasRestantes !== null ? (
                              <span className={`font-semibold ${
                                diasRestantes <= 0 ? 'text-red-600' : 
                                diasRestantes <= 7 ? 'text-orange-600' : 
                                'text-green-600'
                              }`}>
                                {diasRestantes <= 0 ? 'Expirado' : `${diasRestantes} dia(s)`}
                              </span>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            {user.trial_end_date
                              ? new Date(user.trial_end_date).toLocaleDateString('pt-BR')
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end flex-wrap">
                              {user.role !== 'admin' && (
                                <>
                                  <Button
                                    onClick={() => openAjustarTrialDialog(user)}
                                    size="sm"
                                    variant="outline"
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
                                  >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Ajustar Dias
                                  </Button>
                                  <Button
                                    onClick={() => handleRevogar(user.id)}
                                    disabled={revogarAcessoMutation.isPending}
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                                  >
                                    <UserX className="w-4 h-4 mr-2" />
                                    Revogar
                                  </Button>
                                </>
                              )}
                              <Dialog
                                open={isDialogOpen && selectedUser?.id === user.id}
                                onOpenChange={(open) => {
                                  if (!open) {
                                    setIsDialogOpen(false);
                                    setSelectedUser(null);
                                    setError(null);
                                  }
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    onClick={() => openResetDialog(user)}
                                    variant="outline"
                                    size="sm"
                                    className="text-slate-600 hover:text-slate-700"
                                  >
                                    <Key className="w-4 h-4 mr-2" />
                                    Senha
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      <Key className="w-5 h-5 text-blue-600" />
                                      Redefinir Senha - {selectedUser?.full_name || selectedUser?.email}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    {error && (
                                      <Alert variant="destructive">
                                        <AlertCircle className="w-4 h-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                      </Alert>
                                    )}

                                    <div>
                                      <Label htmlFor="newPassword">Nova Senha</Label>
                                      <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Digite a nova senha (mínimo 6 caracteres)"
                                        className="mt-2"
                                      />
                                    </div>

                                    <div>
                                      <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                                      <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Digite novamente a nova senha"
                                        className="mt-2"
                                      />
                                    </div>

                                    <Button
                                      onClick={handleResetPassword}
                                      disabled={resetPasswordMutation.isPending}
                                      className="w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                      {resetPasswordMutation.isPending ? (
                                        <>
                                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                          Redefinindo...
                                        </>
                                      ) : (
                                        <>
                                          <Key className="w-4 h-4 mr-2" />
                                          Redefinir Senha
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card className="mt-6 shadow-md border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-blue-900 text-lg mb-2">
                  💡 Como funciona o sistema de aprovação com período de teste:
                </h4>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                  <li><strong>Novo usuário se cadastra:</strong> Ele verá a tela "Aguardando Aprovação"</li>
                  <li><strong>Você aprova e define os dias:</strong> Ex: 30 dias de teste</li>
                  <li><strong>Usuário acessa normalmente:</strong> Durante o período de teste</li>
                  <li><strong>Quando o trial expira:</strong> O acesso é <strong>revogado automaticamente</strong></li>
                  <li><strong>Você pode estender:</strong> Use "Ajustar Dias" para adicionar mais tempo</li>
                  <li><strong>Ou revogar antes:</strong> Use "Revogar" para bloquear imediatamente</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}