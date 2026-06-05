import { useRoute } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { chatApi } from '../../api/endpoints';
import type { MessageOut } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { Muted, OutlineButton } from '../../components/ui';
import { theme } from '../../theme';

export function ChatScreen() {
  const { bookingId } = useRoute<any>().params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageOut[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [stars, setStars] = useState(0);
  const [rated, setRated] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  async function load() {
    try {
      setMessages(await chatApi.messages(bookingId));
    } catch (e) {
      setError(apiErrorMessage(e));
    }
  }

  // Polling simples para "notificar" novas mensagens (REQ06).
  useEffect(() => {
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, [bookingId]);

  async function send(content: string, msg_type = 'text') {
    if (!content.trim()) return;
    setError(null);
    try {
      await chatApi.send(bookingId, content, msg_type);
      setText('');
      load();
    } catch (e) {
      setError(apiErrorMessage(e));
    }
  }

  async function rate() {
    try {
      await chatApi.rate(bookingId, stars);
      setRated(true);
    } catch (e) {
      setError(apiErrorMessage(e));
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? <Muted>Sem mensagens ainda. Diga olá!</Muted> : null}
        {messages.map((m) => {
          const mine = m.sender_id === user?.id;
          return (
            <View
              key={m.id}
              style={{
                alignSelf: mine ? 'flex-end' : 'flex-start',
                backgroundColor: mine ? theme.colors.primary : theme.colors.card,
                borderRadius: 12,
                padding: 10,
                maxWidth: '80%',
                borderWidth: mine ? 0 : 1,
                borderColor: theme.colors.border,
              }}
            >
              {m.msg_type === 'location' ? (
                <Text style={{ color: mine ? '#fff' : theme.colors.text }}>📍 {m.content}</Text>
              ) : (
                <Text style={{ color: mine ? '#fff' : theme.colors.text }}>{m.content}</Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      {error ? <Text style={{ color: theme.colors.danger, paddingHorizontal: 12 }}>{error}</Text> : null}

      {/* Avaliação 5 estrelas pós-aula (REQ06) */}
      {!rated ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 }}>
          <Muted>Avaliar:</Muted>
          {[1, 2, 3, 4, 5].map((s) => (
            <Pressable key={s} onPress={() => setStars(s)}>
              <Text style={{ fontSize: 22, color: s <= stars ? theme.colors.star : theme.colors.border }}>
                ★
              </Text>
            </Pressable>
          ))}
          {stars > 0 ? <OutlineButton title="Enviar nota" onPress={rate} /> : null}
        </View>
      ) : (
        <Muted>Avaliação enviada. Obrigado!</Muted>
      )}

      <View style={{ flexDirection: 'row', gap: 8, padding: 12, alignItems: 'center' }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Mensagem..."
          placeholderTextColor={theme.colors.muted}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            backgroundColor: '#fff',
          }}
        />
        <Pressable
          onPress={() => send('Minha localização compartilhada', 'location')}
          style={{ padding: 10 }}
        >
          <Text style={{ fontSize: 20 }}>📍</Text>
        </Pressable>
        <Pressable
          onPress={() => send(text)}
          style={{
            backgroundColor: theme.colors.primary,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Enviar</Text>
        </Pressable>
      </View>
    </View>
  );
}
