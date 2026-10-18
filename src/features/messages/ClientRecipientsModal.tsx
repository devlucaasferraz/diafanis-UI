import * as React from 'react';
import { X, Search, Trash2, UserPlus, Users, Calendar } from 'lucide-react';
import { Button } from '@/features/ui/button';
import { Avatar, AvatarFallback } from '@/features/ui/avatar';
import { ClientRecipient } from './types';
import { allOfficeClients } from './mock-data';

export interface ClientRecipientsModalProps {
  isOpen: boolean;
  messageTitle: string;
  clients: ClientRecipient[];
  onClose: () => void;
  onRemoveClient: (clientId: string) => void;
  onAddClient: (client: ClientRecipient) => void;
}

export const ClientRecipientsModal: React.FC<ClientRecipientsModalProps> = ({
  isOpen,
  messageTitle,
  clients,
  onClose,
  onRemoveClient,
  onAddClient,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isAddingMode, setIsAddingMode] = React.useState(false);
  const [addSearchTerm, setAddSearchTerm] = React.useState('');

  if (!isOpen) return null;

  // Clientes vinculados filtrados pela busca
  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Clientes do escritório disponíveis para adicionar (que ainda não estão vinculados)
  const availableToAdd = allOfficeClients.filter(
    (c) =>
      !clients.some((linked) => linked.id === c.id) &&
      (c.name.toLowerCase().includes(addSearchTerm.toLowerCase()) ||
        c.fullName.toLowerCase().includes(addSearchTerm.toLowerCase()))
  );

  const handleSelectAdd = (client: ClientRecipient) => {
    onAddClient(client);
    setIsAddingMode(false);
    setAddSearchTerm('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-recipients-title"
        className="bg-card border border-border/60 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 id="client-recipients-title" className="text-base font-semibold text-foreground tracking-tight">
                Destinatários da Mensagem
              </h2>
              <p className="text-xs text-muted-foreground truncate max-w-[280px] sm:max-w-xs" title={messageTitle}>
                {messageTitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Barra de Pesquisa de Clientes Vinculados */}
        <div className="p-4 border-b border-border/30 bg-muted/10">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar cliente por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-border/50 bg-background/80 py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Lista com máximo de 5 clientes visíveis simultaneamente + Scroll */}
        <div className="p-4 flex-1">
          <div className="flex items-center justify-between pb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Clientes Vinculados ({clients.length})</span>
            <span className="text-[10px] font-normal lowercase">máx. 5 visíveis (scroll para mais)</span>
          </div>

          {/* Container com scroll fixado em altura máxima correspondente a 5 itens */}
          <div
            tabIndex={0}
            aria-label="Lista de clientes vinculados"
            className="max-h-[250px] overflow-y-auto pr-1 space-y-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-lg"
          >
            {filteredClients.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border/60">
                {searchTerm
                  ? 'Nenhum cliente encontrado com esse termo.'
                  : 'Nenhum cliente vinculado a esta mensagem.'}
              </div>
            ) : (
              filteredClients.map((client) => {
                const initials = client.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('');

                return (
                  <div
                    key={client.id}
                    data-testid={`client-item-${client.id}`}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-border/40 bg-card hover:bg-muted/40 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-8 w-8 rounded-lg bg-primary/10 text-primary border border-primary/20">
                        <AvatarFallback className="text-[11px] font-bold">{initials}</AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-foreground truncate">
                          {client.fullName}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          {client.birthDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground/70" />
                              Nasc: {client.birthDate.split('-').reverse().slice(0, 2).join('/')}
                            </span>
                          )}
                          {client.email && (
                            <span className="truncate hidden sm:inline">{client.email}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botão de lixeira para remover cliente da lista */}
                    <button
                      type="button"
                      data-testid={`remove-client-${client.id}`}
                      onClick={() => onRemoveClient(client.id)}
                      title={`Remover ${client.name} da lista`}
                      aria-label={`Remover ${client.name}`}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Posição Fixa: Painel de Adicionar Cliente */}
        <div className="p-4 border-t border-border/40 bg-muted/20">
          {!isAddingMode ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddingMode(true)}
              className="w-full gap-2 border-dashed border-primary/40 text-primary hover:bg-primary/5 hover:border-primary"
            >
              <UserPlus className="h-4 w-4" />
              Adicionar Cliente
            </Button>
          ) : (
            <div className="space-y-2 bg-card p-3 rounded-xl border border-border/60 shadow-sm animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <UserPlus className="h-3.5 w-3.5 text-primary" /> Selecione o cliente para vincular:
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingMode(false)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground text-xs"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Buscar na base do escritório..."
                  value={addSearchTerm}
                  onChange={(e) => setAddSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-border/50 bg-background py-1.5 pl-8 pr-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>

              {/* Lista dos clientes do escritório para adicionar */}
              <div className="max-h-36 overflow-y-auto space-y-1 pt-1">
                {availableToAdd.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground text-center py-2">
                    Nenhum outro cliente disponível para vincular.
                  </p>
                ) : (
                  availableToAdd.map((cand) => (
                    <button
                      key={cand.id}
                      type="button"
                      onClick={() => handleSelectAdd(cand)}
                      className="w-full flex items-center justify-between p-2 rounded-lg text-left text-xs hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/20"
                    >
                      <span className="font-medium truncate">{cand.fullName}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                        {cand.email || cand.phone}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer com Fechar */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-border/30 bg-muted/10">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Concluir
          </Button>
        </div>
      </div>
    </div>
  );
};
