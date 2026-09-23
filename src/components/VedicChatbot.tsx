import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../services/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from './Typography';
import { PremiumCard } from './PremiumCard';
import { searchVedicTexts, generateVedicAnswer } from '../services/vedAstroRagApi';
import { ChatMessage, RagPassage } from '../services/vedAstroRagTypes';
import {
  Sparkles,
  Send,
  X,
  Trash2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  HelpCircle,
  Lock,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const QUICK_SUGGESTIONS = [
  'Which combinations indicate marriage?',
  'What does BPHS say about Saturn in the 7th house?',
  'Explain Raja Yoga.',
  'What are the effects of Rahu?',
  'Which house indicates career?'
];

export const VedicChatbot: React.FC = () => {
  const { user, userProfile } = useAuth();
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<any>();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [expandedSourceIndex, setExpandedSourceIndex] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to bottom when messages list updates
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages, isOpen]);

  // Auth Status Checks
  const isLoggedInAndApproved = user !== null && (userProfile?.role === 'admin' || userProfile?.status === 'approved');

  const handleSend = async (textToSend: string) => {
    const trimmedText = textToSend.trim();
    if (!trimmedText || isLoading) return;

    Keyboard.dismiss();

    // 1. Append User Message
    const userMsgId = Date.now().toString();
    const newUserMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: trimmedText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage('');
    setIsLoading(true);
    setLoadingStatus('Searching classical texts...');

    try {
      // 2. Fetch passages from VedAstro RAG API
      const passages = await searchVedicTexts(trimmedText);

      // 3. Generate answer programmatically
      setLoadingStatus('Consolidating passages...');
      let finalAnswer = '';
      
      if (!passages || passages.length === 0) {
        finalAnswer = "I couldn't find a relevant reference in the available classical texts.";
      } else {
        finalAnswer = await generateVedicAnswer(trimmedText, passages, messages);
      }

      // 4. Append Assistant Message
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: finalAnswer,
        passages: passages && passages.length > 0 ? passages : undefined,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error: any) {
      console.error('Chatbot request error:', error);
      
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I encountered an error while consulting the Vedic classical texts. Please check your network and try again.',
        timestamp: new Date().toISOString(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  const clearChat = () => {
    setMessages([]);
    setExpandedSourceIndex(null);
  };

  const toggleSourceExpand = (messageId: string, passageIndex: number) => {
    const key = `${messageId}-${passageIndex}`;
    setExpandedSourceIndex(expandedSourceIndex === key ? null : key);
  };

  const handleAuthRedirect = () => {
    setIsOpen(false);
    navigation.navigate('Account');
  };

  const renderLockedState = () => {
    return (
      <View style={[styles.lockedContainer, { backgroundColor: colors.background }]}>
        {/* Close Button Header */}
        <View style={styles.lockedHeader}>
          <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.headerBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <X size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Lock Info */}
        <View style={styles.lockedContent}>
          <View style={[styles.lockIconCircle, { backgroundColor: isDark ? 'rgba(212, 175, 55, 0.08)' : 'rgba(212, 175, 55, 0.05)', borderColor: colors.primary }]}>
            <Lock size={34} color={colors.primary} />
          </View>

          <Typography variant="title" weight="bold" style={styles.lockedTitle}>
            Divine Wisdom Locked
          </Typography>

          <Typography variant="body" color="muted" style={styles.lockedSubtitle}>
            Access to the classical Vedic scriptures requires an active and verified account.
          </Typography>

          <PremiumCard style={styles.lockedCard}>
            <Typography variant="caption" weight="medium" style={styles.lockedCardText}>
              {!user
                ? 'Please sign in or create an account to begin using the Vedic scripture AI assistant.'
                : 'Your profile verification is currently pending admin approval. Access will be unlocked once approved.'}
            </Typography>
          </PremiumCard>

          <TouchableOpacity
            style={styles.lockedButton}
            onPress={handleAuthRedirect}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={colors.primaryGradient ? [colors.primaryGradient[0], colors.primaryGradient[1]] : ['#D4AF37', '#FF9933']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.lockedButtonGradient}
            >
              <Typography variant="body" weight="bold" style={{ color: '#000000', fontSize: 15 }}>
                {!user ? 'Log In / Register' : 'Check Account Status'}
              </Typography>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSourceItem = (passage: RagPassage, index: number, messageId: string) => {
    const key = `${messageId}-${index}`;
    const isExpanded = expandedSourceIndex === key;
    const percentageScore = Math.round(passage.score * 100);

    return (
      <View key={key} style={[styles.sourceItem, { borderColor: colors.border }]}>
        <TouchableOpacity
          style={styles.sourceHeader}
          onPress={() => toggleSourceExpand(messageId, index)}
          activeOpacity={0.7}
        >
          <View style={styles.sourceBookTitleContainer}>
            <BookOpen size={14} color={colors.primary} style={styles.bookIcon} />
            <Typography variant="caption" weight="medium" style={styles.sourceText}>
              {passage.sourceName} (p. {passage.pageNumber})
            </Typography>
          </View>
          <View style={styles.sourceScoreContainer}>
            <Typography variant="caption" style={{ color: colors.primary, fontSize: 11, marginRight: 4 }} weight="semibold">
              {percentageScore}% match
            </Typography>
            {isExpanded ? (
              <ChevronUp size={14} color={colors.textSecondary} />
            ) : (
              <ChevronDown size={14} color={colors.textSecondary} />
            )}
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={[styles.sourceContent, { backgroundColor: isDark ? '#1a1a22' : '#f8fafc' }]}>
            <Typography style={styles.passageText} variant="caption">
              "{passage.text.replace(/<br>/g, '\n').trim()}"
            </Typography>
            <Typography style={styles.chunkMeta} variant="caption" color="muted">
              Chunk Index: {passage.chunkIndex}
            </Typography>
          </View>
        )}
      </View>
    );
  };

  const renderMessageItem = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    
    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.assistantRow]}>
        {!isUser && (
          <View style={[styles.avatarCircle, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
            <Sparkles size={16} color={colors.primary} />
          </View>
        )}
        
        <View style={styles.messageBubbleWrapper}>
          <View
            style={[
              styles.messageBubble,
              isUser
                ? [styles.userBubble, { backgroundColor: colors.primary }]
                : [styles.assistantBubble, { backgroundColor: colors.surface, borderColor: item.isError ? '#ef4444' : colors.border }],
            ]}
          >
            <Typography
              variant="body"
              style={[
                styles.messageText,
                { color: isUser ? '#000000' : colors.text },
              ]}
              weight={isUser ? 'medium' : 'regular'}
            >
              {item.content}
            </Typography>
          </View>

          {/* Sources Section */}
          {!isUser && item.passages && item.passages.length > 0 && (
            <View style={styles.sourcesContainer}>
              <Typography variant="caption" color="muted" weight="semibold" style={styles.sourcesTitle}>
                SOURCES USED:
              </Typography>
              {item.passages.map((passage, index) => renderSourceItem(passage, index, item.id))}
            </View>
          )}

          <Typography variant="caption" color="muted" style={styles.timeText}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        </View>
      </View>
    );
  };

  return (
    <>
      {/* Floating Action Button (FAB) - Celestial Overlapping Sparkle Design */}
      <TouchableOpacity
        style={[
          styles.fabContainer,
          {
            shadowColor: isDark ? colors.primary : '#000000',
            shadowOpacity: isDark ? 0.4 : 0.25,
            borderColor: isDark ? 'rgba(212, 175, 55, 0.4)' : colors.border,
            backgroundColor: colors.surface,
          }
        ]}
        activeOpacity={0.85}
        onPress={() => setIsOpen(true)}
      >
        <LinearGradient
          colors={colors.primaryGradient ? [colors.primaryGradient[0], colors.primaryGradient[1]] : ['#D4AF37', '#FF9933']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <MessageCircle size={25} color="#000000" />
        </LinearGradient>
        
        {/* Floating golden celestial sparkle badge */}
        <View style={[styles.fabBadge, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: colors.primary }]}>
          <Sparkles size={11} color={colors.primary} />
        </View>
      </TouchableOpacity>

      {/* Chat Overlay Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.65)' }]}>
          {!isLoggedInAndApproved ? (
            renderLockedState()
          ) : (
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={[styles.chatContainer, { backgroundColor: colors.background }]}
            >
              {/* Header */}
              <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <View style={styles.headerTitleRow}>
                  <LinearGradient
                    colors={['#D4AF37', '#FF9933']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerIconCircle}
                  >
                    <Sparkles size={16} color="#000000" />
                  </LinearGradient>
                  <View>
                    <Typography variant="subtitle" weight="bold">Vedic Book Assistant</Typography>
                    <Typography variant="caption" color="muted" style={{ fontSize: 11 }}>
                      Semantic RAG Scripture Search
                    </Typography>
                  </View>
                </View>
                
                <View style={styles.headerActions}>
                  {messages.length > 0 && (
                    <TouchableOpacity onPress={clearChat} style={styles.headerBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Trash2 size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.headerBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <X size={22} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Message Area */}
              {messages.length === 0 ? (
                <ScrollView 
                  contentContainerStyle={styles.welcomeContainer}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.welcomeCircle}>
                    <Sparkles size={40} color={colors.primary} />
                  </View>
                  <Typography variant="title" weight="bold" style={styles.welcomeTitle}>
                    Ask the Shastras
                  </Typography>
                  <Typography variant="body" color="muted" style={styles.welcomeSubtitle}>
                    Ask natural language questions to search classical Vedic texts like Brihat Parashara Hora Shastra, Phaladeepika, and Jataka Parijata.
                  </Typography>

                  <View style={styles.suggestionsContainer}>
                    <Typography variant="caption" color="muted" weight="bold" style={styles.suggestionsHeader}>
                      SUGGESTED QUESTIONS
                    </Typography>
                    {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.suggestionChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => handleSend(suggestion)}
                      >
                        <HelpCircle size={14} color={colors.primary} style={{ marginRight: 8 }} />
                        <Typography variant="caption" weight="medium" style={{ flex: 1, color: colors.text }}>
                          {suggestion}
                        </Typography>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              ) : (
                <FlatList
                  ref={flatListRef}
                  data={messages}
                  renderItem={renderMessageItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.messageList}
                  keyboardShouldPersistTaps="handled"
                />
              )}

              {/* Loading Indicator */}
              {isLoading && (
                <View style={[styles.loadingIndicatorContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Typography variant="caption" style={styles.loadingText} color="muted">
                    {loadingStatus}
                  </Typography>
                </View>
              )}

              {/* Input Footer */}
              <SafeAreaView style={[styles.footer, { borderTopColor: colors.border }]}>
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    placeholder="Ask about Saturn, Raja Yoga, career..."
                    placeholderTextColor={isDark ? '#555560' : '#94a3b8'}
                    value={inputMessage}
                    onChangeText={setInputMessage}
                    multiline={false}
                    maxLength={150}
                    onSubmitEditing={() => handleSend(inputMessage)}
                    editable={!isLoading}
                  />
                  
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      {
                        backgroundColor: inputMessage.trim().length > 0 && !isLoading
                          ? colors.primary
                          : colors.surfaceVariant
                      }
                    ]}
                    onPress={() => handleSend(inputMessage)}
                    disabled={inputMessage.trim().length === 0 || isLoading}
                  >
                    <Send size={18} color={inputMessage.trim().length > 0 && !isLoading ? '#000000' : '#888888'} />
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </KeyboardAvoidingView>
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 100, // Floats cleanly above the bottom navigation bar (height ~84px)
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    elevation: 10,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
    zIndex: 999,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  chatContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: SCREEN_HEIGHT * 0.85,
    width: SCREEN_WIDTH,
    overflow: 'hidden',
  },
  lockedContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: SCREEN_HEIGHT * 0.85,
    width: SCREEN_WIDTH,
    paddingHorizontal: 24,
    paddingBottom: 40,
    overflow: 'hidden',
  },
  lockedHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 14,
  },
  lockedContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  lockIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  lockedTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  lockedSubtitle: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  lockedCard: {
    width: '100%',
    marginBottom: 32,
  },
  lockedCardText: {
    textAlign: 'center',
    lineHeight: 18,
  },
  lockedButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  lockedButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn: {
    padding: 6,
    marginLeft: 10,
  },
  welcomeContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  welcomeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  suggestionsContainer: {
    width: '100%',
    paddingHorizontal: 8,
  },
  suggestionsHeader: {
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 10,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 18,
    width: '100%',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  assistantRow: {
    justifyContent: 'flex-start',
  },
  avatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
    borderWidth: 1,
  },
  messageBubbleWrapper: {
    maxWidth: '82%',
  },
  messageBubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  userBubble: {
    borderTopRightRadius: 4,
  },
  assistantBubble: {
    borderTopLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  sourcesContainer: {
    marginTop: 8,
    paddingLeft: 4,
  },
  sourcesTitle: {
    fontSize: 9,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  sourceItem: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
    overflow: 'hidden',
  },
  sourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sourceBookTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  bookIcon: {
    marginRight: 6,
  },
  sourceText: {
    flex: 1,
    fontSize: 12,
  },
  sourceScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceContent: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  passageText: {
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  chunkMeta: {
    fontSize: 10,
    marginTop: 6,
    textAlign: 'right',
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
    paddingRight: 6,
  },
  loadingIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    position: 'absolute',
    bottom: 80,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 4 : 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 18,
    fontSize: 15,
    marginRight: 10,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});
