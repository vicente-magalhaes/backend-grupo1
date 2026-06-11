import { useRoute } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { apiErrorMessage } from '../../api/client';
import { chatApi } from '../../api/endpoints';
import type { MessageOut } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { Button, Icon, Muted, StarPicker, Toast, Txt } from '../../components';
import { theme } from '../../theme';

export function ChatScreen() {
  const { bookingId } = useRoute<any>().params;
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: theme.space.md, gap: theme.space.sm }}
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
                maxWidth: '80%',
                backgroundColor: mine ? theme.colors.accent : theme.colors.surface,
                borderRadius: 18,
                borderTopRightRadius: mine ? 4 : 18,
                borderTopLeftRadius: mine ? 18 : 4,
                paddingHorizontal: 14,
                paddingVertical: 10,
                ...theme.shadows.sm,
              }}
            >
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                {m.msg_type === 'location' ? (
                  <Icon name="location" size={14} color={mine ? '#fff' : theme.colors.accent} />
                ) : null}
                <Txt variant="body" color={mine ? '#fff' : theme.colors.text}>
                  {m.content}
                </Txt>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {error ? (
        <View style={{ paddingHorizontal: theme.space.md }}>
          <Toast message={error} />
        </View>
      ) : null}

      {/* Avaliação 5 estrelas pós-aula (REQ06) */}
      {!rated ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.space.sm,
            paddingHorizontal: theme.space.md,
            paddingVertical: theme.space.xs,
          }}
        >
          <Muted>Avaliar:</Muted>
          <StarPicker value={stars} onChange={setStars} size={24} />
          {stars > 0 ? <Button title="Enviar" variant="ghost" size="sm" onPress={rate} /> : null}
        </View>
      ) : (
        <View style={{ paddingHorizontal: theme.space.md }}>
          <Muted>Avaliação enviada. Obrigado!</Muted>
        </View>
      )}

      <View
        style={{
          flexDirection: 'row',
          gap: theme.space.sm,
          padding: theme.space.md,
          paddingBottom: theme.space.md + insets.bottom,
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.separator,
        }}
      >
        <Pressable
          onPress={() => send('Minha localização compartilhada', 'location')}
          hitSlop={6}
          style={{ padding: 4 }}
        >
          <Icon name="location-outline" size={24} color={theme.colors.accent} />
        </Pressable>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Mensagem..."
          placeholderTextColor={theme.colors.textTertiary}
          onSubmitEditing={() => send(text)}
          style={{
            flex: 1,
            backgroundColor: theme.colors.surfaceSecondary,
            borderRadius: theme.radii.pill,
            paddingHorizontal: theme.space.md,
            paddingVertical: 10,
            fontFamily: theme.fonts.regular,
            fontSize: 16,
            color: theme.colors.text,
          }}
        />
        <Pressable
          onPress={() => send(text)}
          disabled={!text.trim()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.colors.accent,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: text.trim() ? 1 : 0.4,
          }}
        >
          <Icon name="send" size={18} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
