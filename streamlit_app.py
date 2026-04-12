import streamlit as st
import pandas as pd
from datetime import datetime, time
import random

# Set the title and favicon that appear in the Browser's tab bar.
st.set_page_config(
    page_title='CNH Connect',
    page_icon='🚗',
    layout='wide',
    initial_sidebar_state='expanded'
)

# Paleta de cores
PRIMARY_COLOR = '#E3F2FD'  # Azul-claro
SECONDARY_COLOR = '#FFFFFF'  # Branco
ACCENT_COLOR = '#F5F5F5'  # Cinza suave
SUCCESS_COLOR = '#4CAF50'  # Verde
ERROR_COLOR = '#F44336'  # Vermelho

# Função para criar cartões
def create_card(title, content, icon='📄'):
    st.markdown(f"""
    <div style="background-color: {SECONDARY_COLOR}; border-radius: 10px; padding: 20px; margin: 10px 0; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <h3 style="color: #333; margin-bottom: 10px;">{icon} {title}</h3>
        {content}
    </div>
    """, unsafe_allow_html=True)

# Dados mock
mock_alunos = [
    {'nome': 'João Silva', 'foto': '👤', 'nota': 4.5, 'aulas': 15, 'veiculo': 'Sim'},
    {'nome': 'Maria Santos', 'foto': '👩', 'nota': 4.8, 'aulas': 22, 'veiculo': 'Não'},
    {'nome': 'Pedro Oliveira', 'foto': '👨', 'nota': 4.2, 'aulas': 8, 'veiculo': 'Sim'},
]

mock_agendamentos = [
    {'instrutor': 'Carlos Mendes', 'categoria': 'A', 'data': '2024-04-15', 'horario': '14:00', 'status': 'confirmado'},
    {'instrutor': 'Ana Costa', 'categoria': 'B', 'data': '2024-04-18', 'horario': '10:00', 'status': 'aguardando'},
]

mock_notificacoes = [
    {'data': '2024-04-12', 'hora': '09:30', 'mensagem': 'Aula confirmada com Carlos Mendes', 'status': 'confirmado'},
    {'data': '2024-04-11', 'hora': '16:45', 'mensagem': 'Pagamento processado', 'status': 'pagamento'},
    {'data': '2024-04-10', 'hora': '11:20', 'mensagem': 'Nova avaliação recebida', 'status': 'avaliacao'},
]

mock_solicitacoes = [
    {'aluno': 'João Silva', 'foto': '👤', 'nota': 4.5, 'data': '2024-04-16', 'horario': '15:00', 'regiao': 'Centro', 'categoria': 'A', 'modalidade': 'Manual'},
    {'aluno': 'Maria Santos', 'foto': '👩', 'nota': 4.8, 'data': '2024-04-17', 'horario': '09:00', 'regiao': 'Zona Sul', 'categoria': 'B', 'modalidade': 'Automático'},
]

# Função principal
def main():
    st.title('🚗 CNH Connect')

    # Sidebar para seleção de visão
    visao = st.sidebar.selectbox('Selecione a visão:', ['Aluno', 'Instrutor'])

    if visao == 'Aluno':
        visao_aluno()
    else:
        visao_instrutor()

def visao_aluno():
    st.sidebar.title('Menu - Aluno')
    opcao = st.sidebar.radio('Navegação', ['Perfil', 'Notificações', 'Agendamentos', 'Buscar Instrutores', 'Pagamento', 'Chat', 'Sair'])

    if opcao == 'Perfil':
        tela_perfil_aluno()
    elif opcao == 'Notificações':
        tela_notificacoes()
    elif opcao == 'Agendamentos':
        tela_agendamentos()
    elif opcao == 'Buscar Instrutores':
        tela_busca_instrutores()
    elif opcao == 'Pagamento':
        tela_pagamento()
    elif opcao == 'Chat':
        tela_chat()
    elif opcao == 'Sair':
        st.write('Logout realizado.')

def visao_instrutor():
    st.sidebar.title('Menu - Instrutor')
    opcao = st.sidebar.radio('Navegação', ['Perfil', 'Notificações', 'Solicitações', 'Agenda', 'Relatório de Aula', 'Dashboard de Evolução', 'Sair'])

    if opcao == 'Perfil':
        tela_perfil_instrutor()
    elif opcao == 'Notificações':
        tela_notificacoes()
    elif opcao == 'Solicitações':
        tela_solicitacoes()
    elif opcao == 'Agenda':
        tela_agenda()
    elif opcao == 'Relatório de Aula':
        tela_relatorio_aula()
    elif opcao == 'Dashboard de Evolução':
        tela_dashboard_evolucao()
    elif opcao == 'Sair':
        st.write('Logout realizado.')

def tela_perfil_aluno():
    st.header('👤 Perfil do Aluno')
    col1, col2 = st.columns([1, 2])
    with col1:
        st.image('https://via.placeholder.com/150', caption='Foto do perfil')
    with col2:
        nome = st.text_input('Nome Completo', 'João Silva')
        email = st.text_input('E-mail', 'joao@email.com')
        telefone = st.text_input('Telefone', '(11) 99999-9999')
        cpf = st.text_input('CPF', '123.456.789-00')
        senha = st.text_input('Senha', type='password')
        endereco = st.text_area('Endereço do Ponto de Encontro', 'Rua Exemplo, 123, São Paulo - SP')
        if st.button('Salvar Alterações'):
            st.success('Perfil atualizado com sucesso!')

def tela_notificacoes():
    st.header('🔔 Minhas Notificações')
    for notif in mock_notificacoes:
        icon = '✅' if notif['status'] == 'confirmado' else '💳' if notif['status'] == 'pagamento' else '⭐'
        create_card(f"{notif['data']} {notif['hora']}", f"{icon} {notif['mensagem']}", icon)

def tela_agendamentos():
    st.header('📅 Meus Agendamentos')
    for ag in mock_agendamentos:
        status_icon = '🟢' if ag['status'] == 'confirmado' else '🟡' if ag['status'] == 'aguardando' else '🔴'
        create_card(f"{ag['instrutor']} - {ag['categoria']}", f"📅 {ag['data']} ⏰ {ag['horario']} {status_icon} {ag['status'].capitalize()}", '🚗')

def tela_busca_instrutores():
    st.header('🔍 Buscar Instrutores')
    col1, col2, col3 = st.columns(3)
    with col1:
        categoria = st.selectbox('Categoria', ['A', 'B'])
    with col2:
        regiao = st.selectbox('Região', ['Centro', 'Zona Sul', 'Zona Norte'])
    with col3:
        modalidade = st.selectbox('Modalidade', ['Manual', 'Automático'])

    st.subheader('Instrutores Disponíveis')
    for instr in mock_alunos:  # Usando mock_alunos como instrutores para exemplo
        col1, col2 = st.columns([1, 3])
        with col1:
            st.write(f"{instr['foto']} {instr['nome']}")
        with col2:
            st.write(f"⭐ {instr['nota']} | 📚 {instr['aulas']} aulas | 🚗 {instr['veiculo']}")
            if st.button(f'Selecionar {instr["nome"]}', key=instr['nome']):
                st.session_state.selected_instrutor = instr
                st.success(f'Instrutor {instr["nome"]} selecionado!')

    if 'selected_instrutor' in st.session_state:
        st.subheader(f'Perfil de {st.session_state.selected_instrutor["nome"]}')
        st.write('Descrição: Instrutor experiente com foco em segurança.')
        st.write('⭐⭐⭐⭐⭐ Avaliações positivas.')
        # Agenda interativa simples
        data = st.date_input('Selecione data')
        horario = st.time_input('Selecione horário')
        if st.button('Solicitar Aula'):
            st.success('Aula solicitada!')

def tela_pagamento():
    st.header('💳 Pagamento')
    valor = st.number_input('Valor Total', value=150.0)
    metodo = st.selectbox('Método de Pagamento', ['Cartão de Crédito', 'Cartão de Débito', 'Pix'])
    if st.button('Confirmar Pagamento'):
        st.success('Pagamento realizado! Comprovante enviado por e-mail.')

def tela_chat():
    st.header('💬 Chat')
    mensagens = st.text_area('Mensagens', 'Olá! Como posso ajudar?')
    localizacao = st.checkbox('Compartilhar Localização')
    if st.button('Enviar'):
        st.write('Mensagem enviada!')

def tela_perfil_instrutor():
    st.header('👤 Perfil do Instrutor')
    col1, col2 = st.columns([1, 2])
    with col1:
        st.image('https://via.placeholder.com/150', caption='Foto do perfil')
    with col2:
        nome = st.text_input('Nome', 'Carlos Mendes')
        email = st.text_input('E-mail', 'carlos@email.com')
        telefone = st.text_input('Telefone', '(11) 88888-8888')
        cnh = st.text_input('CNH', '123456789')
        credencial = st.text_input('Credencial Oficial', 'ABC123')
        categorias = st.multiselect('Categorias Habilitadas', ['A', 'B'], ['A'])
        veiculo = st.selectbox('Veículo Próprio', ['Sim', 'Não'])
        if veiculo == 'Sim':
            st.file_uploader('Upload CRLV')
            st.file_uploader('Upload Foto do Veículo')
        if st.button('Salvar Alterações'):
            st.success('Perfil atualizado com sucesso!')

def tela_solicitacoes():
    st.header('📋 Minhas Solicitações')
    for sol in mock_solicitacoes:
        create_card(f"{sol['aluno']} - {sol['categoria']}", f"👤 {sol['foto']} ⭐ {sol['nota']} 📅 {sol['data']} ⏰ {sol['horario']} 📍 {sol['regiao']} 🚗 {sol['modalidade']}", '📄')
        col1, col2 = st.columns(2)
        with col1:
            if st.button(f'Aceitar {sol["aluno"]}', key=f'aceitar_{sol["aluno"]}'):
                st.success(f'Solicitação de {sol["aluno"]} aceita!')
        with col2:
            motivo = st.text_input(f'Motivo para recusar {sol["aluno"]}', key=f'motivo_{sol["aluno"]}')
            if st.button(f'Recusar {sol["aluno"]}', key=f'recusar_{sol["aluno"]}'):
                if motivo:
                    st.error(f'Solicitação de {sol["aluno"]} recusada. Motivo: {motivo}')
                else:
                    st.warning('Motivo obrigatório para recusa.')

def tela_agenda():
    st.header('📅 Minha Agenda')
    st.write('Horários disponíveis: 08:00 - 18:00')
    # Simulação de agenda
    dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']
    for dia in dias:
        st.subheader(dia)
        col1, col2, col3 = st.columns(3)
        with col1:
            st.write('08:00 - 10:00: Disponível')
        with col2:
            st.write('10:00 - 12:00: Bloqueado')
        with col3:
            st.write('14:00 - 16:00: Disponível')

def tela_relatorio_aula():
    st.header('📝 Relatório de Aula')
    aluno = st.selectbox('Selecionar Aluno', ['João Silva', 'Maria Santos'])
    baliza = st.slider('Baliza', 0, 10, 7)
    percurso = st.slider('Percurso', 0, 10, 8)
    embreagem = st.slider('Controle de Embreagem', 0, 10, 6)
    observacoes = st.text_area('Observações', 'Bom progresso, precisa melhorar na baliza.')
    if st.button('Salvar Relatório'):
        st.success('Relatório salvo!')

def tela_dashboard_evolucao():
    st.header('📊 Dashboard de Evolução')
    aluno = st.selectbox('Selecionar Aluno', ['João Silva', 'Maria Santos'])
    st.subheader('Progresso nas Habilidades')
    st.bar_chart({'Baliza': [7, 8, 9], 'Percurso': [6, 8, 9], 'Embreagem': [5, 6, 7]})
    st.subheader('Probabilidade de Aprovação')
    prob = random.randint(60, 95)
    st.metric('Probabilidade Estimada', f'{prob}%')

if __name__ == '__main__':
    main()