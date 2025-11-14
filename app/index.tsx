// index.tsx (corrigido — completo)
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StatusBar as RNStatusBar,
  Platform,
} from "react-native";

import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { StatusBar } from "expo-status-bar";
import Constants from 'expo-constants';
import * as Font from "expo-font";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import axios from "axios";
import { LineChart } from "react-native-chart-kit";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

// ---------- Tipagens ----------
type Position = {
  id: string;
  name: string;
  symbol: string;
  quantity: number;
  entryPrice: number;
  timestamp: number;
};

type Coin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
};

// ---------- Constantes ----------
const COINGECKO_BASE = "https://cors.isomorphic-git.org/https://api.coingecko.com/api/v3";
const STORAGE_POSITIONS = "@criptonow:positions";
const STORAGE_FAVORITES = "@criptonow:favorites";
const SCREEN_WIDTH = Dimensions.get("window").width;

// ---------- Navegação ----------
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ---------- App principal ----------
function AppRoot() {
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);

  // Carregar fontes (opcional)
  useEffect(() => {
    (async () => {
      try {
        // se quiser carregar fontes customizadas, descomente e adapte o path:
        // await Font.loadAsync({ 'Inter-Black': require('../assets/fonts/Inter-Black.ttf') });
      } catch (e) {
        console.warn('Erro ao carregar fonte:', e);
      } finally {
        setFontsLoaded(true);
      }
    })();
  }, []);

  // Configurar expo-notifications somente em plataformas suportadas (não web)
  useEffect(() => {
    if (Platform.OS !== 'web') {
      (async () => {
        try {
          const Notifications = await import('expo-notifications');
          Notifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: true,
              shouldPlaySound: false,
              shouldSetBadge: false,
              shouldShowBanner: true,
              shouldShowList: true,
            }),
          });
        } catch (e) {
          console.warn('Não foi possível configurar expo-notifications (provavelmente em web):', e);
        }
      })();
    }
  }, []);

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#60a5fa" />
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <NavigationContainer theme={DarkTheme}>
          <MainDrawer />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// ---------- Navegadores ----------
function MainDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: "#030712" },
        headerTintColor: "#fff",
        drawerStyle: { backgroundColor: "#071129" },
        drawerActiveTintColor: "#60a5fa",
      }}
    >
      <Drawer.Screen name="Home" component={HomeStack} />
      <Drawer.Screen name="Mercados" component={MarketsTabs} />
      <Drawer.Screen name="Carteira" component={WalletScreen} />
      <Drawer.Screen name="Perfil" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: "#030712" }, headerTintColor: "#fff" }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: "CriptoNow" }} />
      <Stack.Screen name="CoinDetails" component={CoinDetailsScreen} options={{ title: "Detalhes" }} />
    </Stack.Navigator>
  );
}

function MarketsTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#071129" },
        tabBarActiveTintColor: "#60a5fa",
        tabBarInactiveTintColor: "#94a3b8",
      }}
    >
      <Tab.Screen name="Todas" component={MarketsScreen} />
      <Tab.Screen name="Favoritas" component={MarketsScreen} initialParams={{ favoritesOnly: true }} />
    </Tab.Navigator>
  );
}

// ====== TELAS =========

// Home
function HomeScreen({ navigation }: any) {
  const [topCoins, setTopCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${COINGECKO_BASE}/coins/markets`, {
          params: { vs_currency: "brl", order: "market_cap_desc", per_page: 10, page: 1, sparkline: false },
        });
        setTopCoins(res.data);
      } catch (e) {
        Alert.alert("Erro", "Não foi possível carregar top coins.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <RNStatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.title}>CriptoNow</Text>
        <Text style={styles.subtitle}>Top 10 por market cap</Text>
        {loading ? <ActivityIndicator style={{ marginTop: 20 }} /> : null}
        <FlatList
          data={topCoins}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => <CoinCard coin={item} onPress={() => navigation.navigate("CoinDetails", { id: item.id })} />}
          contentContainerStyle={{ paddingVertical: 8 }}
        />

        <View style={{ height: 12 }} />

        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("Mercados" as any)}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Ver mercados completos</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Markets Screen
function MarketsScreen({ navigation, route }: any) {
  const favoritesOnly = route?.params?.favoritesOnly ?? false;
  const [coins, setCoins] = useState<Coin[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // carregar favoritos do AsyncStorage
  useEffect(() => {
    (async () => {
      const f = await AsyncStorage.getItem(STORAGE_FAVORITES);
      setFavorites(f ? JSON.parse(f) : []);
    })();
  }, []);

  // buscar moedas
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${COINGECKO_BASE}/coins/markets`, {
          params: { vs_currency: "brl", order: "market_cap_desc", per_page: 100, page: 1, sparkline: false },
        });
        setCoins(res.data);
      } catch (e) {
        Alert.alert("Erro", "Não foi possível carregar as cotações.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleFav = async (id: string) => {
    let f = favorites.slice();
    if (f.includes(id)) f = f.filter((x) => x !== id);
    else f.push(id);
    setFavorites(f);
    await AsyncStorage.setItem(STORAGE_FAVORITES, JSON.stringify(f));
    try { const Haptics = await import('expo-haptics'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch(e){/* ignore on web */}
  };

  const filtered = coins.filter((c) => {
    if (favoritesOnly && !favorites.includes(c.id)) return false;
    if (!query) return true;
    return c.name.toLowerCase().includes(query.toLowerCase()) || c.symbol.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: 12 }}>
        <TextInput placeholder="Buscar moeda (nome ou símbolo)" placeholderTextColor="#94a3b8" value={query} onChangeText={setQuery} style={styles.searchInput} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <CoinCard
              coin={item}
              onPress={() => navigation.navigate("CoinDetails", { id: item.id })}
              onFavorite={() => toggleFav(item.id)}
              favorite={favorites.includes(item.id)}
            />
          )}
          contentContainerStyle={{ padding: 12 }}
        />
      )}
    </SafeAreaView>
  );
}

// Coin Details Screen
function CoinDetailsScreen({ route }: any) {
  const { id } = route.params;
  const [coin, setCoin] = useState<any | null>(null);
  const [prices, setPrices] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${COINGECKO_BASE}/coins/${id}`, { params: { localization: false, tickers: false, community_data: false, developer_data: false, sparkline: false } });
        setCoin(res.data);

        const ch = await axios.get(`${COINGECKO_BASE}/coins/${id}/market_chart`, { params: { vs_currency: "brl", days: 7 } });
        const arr: number[] = ch.data.prices.map((p: any[]) => p[1]);
        setPrices(arr);
      } catch (e) {
        Alert.alert("Erro", "Erro ao carregar detalhes da moeda.");
      } finally {
        setLoading(false);
      }
    })();
    (async () => {
      const s = await AsyncStorage.getItem(STORAGE_POSITIONS);
      setPositions(s ? JSON.parse(s) : []);
    })();
  }, [id]);

  const addPosition = async (qty = 1) => {
    if (!coin) return;
    const position: Position = {
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      quantity: qty,
      entryPrice: coin.market_data?.current_price?.brl ?? 0,
      timestamp: Date.now(),
    };
    const newPositions = [...positions, position];
    setPositions(newPositions);
    await AsyncStorage.setItem(STORAGE_POSITIONS, JSON.stringify(newPositions));
    setModalVisible(false);
    try { const Haptics = await import('expo-haptics'); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) { /* ignore on web */ }

    // agendar notificação somente em plataformas suportadas
    if (Platform.OS !== 'web') {
      try {
        const Notifications = await import('expo-notifications');
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Posição adicionada (simulada)",
            body: `${position.quantity}x ${position.name} a R$ ${position.entryPrice}`,
          },
          trigger: {
            type: 'timeInterval',
            seconds: 2,
            repeats: false,
          } as any,
        } as any);
      } catch (e) {
        console.warn('Não foi possível agendar notificação (provavelmente web):', e);
      }
    }

    Alert.alert("Confirmado", "Posição simulada adicionada à carteira local.");
  };

  if (loading || !coin) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{ marginTop: 20 }} />
      </SafeAreaView>
    );
  }

  const current = coin.market_data?.current_price?.brl ?? 0;
  const change24 = coin.market_data?.price_change_percentage_24h ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image source={{ uri: coin.image?.small }} style={{ width: 48, height: 48, marginRight: 12 }} />
          <View>
            <Text style={styles.title}>{coin.name} ({coin.symbol.toUpperCase()})</Text>
            <Text style={styles.subtitle}>Market Cap: {formatShortNumber(coin.market_data?.market_cap?.brl ?? 0)}</Text>
          </View>
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={styles.largePrice}>R$ {numberToBRL(current)}</Text>
          <Text style={{ color: change24 >= 0 ? "#16a34a" : "#dc2626", marginTop: 6 }}>{change24?.toFixed(2)}% (24h)</Text>
        </View>

        <View style={{ marginTop: 16 }}>
          <Text style={{ color: "#94a3b8", marginBottom: 8 }}>Gráfico (7 dias)</Text>
          {prices.length > 0 ? <PriceChart data={prices} /> : <ActivityIndicator />}
        </View>

        <View style={{ height: 14 }} />

        <TouchableOpacity style={styles.primaryButton} onPress={() => setModalVisible(true)}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Simular Compra</Text>
        </TouchableOpacity>

        <View style={{ height: 8 }} />

        <TouchableOpacity style={styles.secondaryButton} onPress={async () => { await Clipboard.setStringAsync(coin.links?.homepage?.[0] ?? ""); Alert.alert("Copiado", "Link copiado para a área de transferência."); }}>
          <Text style={{ color: "#fff" }}>Copiar site</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de confirmação/simulação */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 6 }}>Confirmar compra simulada</Text>
            <Text style={{ color: "#475569", marginBottom: 12 }}>Adicionar 1 unidade de {coin.name} à carteira simulada por R$ {numberToBRL(current)}?</Text>
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setModalVisible(false)}>
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#10b981" }]} onPress={() => addPosition(1)}>
                <Text style={{ color: "#fff" }}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Carteira simulada
function WalletScreen() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const s = await AsyncStorage.getItem(STORAGE_POSITIONS);
      setPositions(s ? JSON.parse(s) : []);
      setLoading(false);
    })();
  }, []);

  const exportJSON = async () => {
    const json = JSON.stringify(positions, null, 2);
    // SecureStore não está disponível no web — usamos fallback para AsyncStorage quando em web
    if (Platform.OS !== 'web') {
      try {
        const SecureStore = await import('expo-secure-store');
        await SecureStore.setItemAsync("@criptonow:last_export", json);
        Alert.alert("Exportado", "A carteira foi salva localmente (SecureStore). Você pode copiar pelo app.");
        return;
      } catch (e) {
        console.warn('SecureStore falhou (não crítico):', e);
      }
    }
    // fallback web
    await AsyncStorage.setItem('@criptonow:last_export_web', json);
    Alert.alert("Exportado", "A carteira foi salva localmente (AsyncStorage web). Você pode copiar pelo app.");
  };

  const clear = async () => {
    await AsyncStorage.removeItem(STORAGE_POSITIONS);
    setPositions([]);
    Alert.alert("Limpo", "Carteira simulada esvaziada.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: 16 }}>
        <Text style={styles.title}>Carteira Simulada</Text>
        <Text style={styles.subtitle}>Posições adicionadas localmente</Text>
        <View style={{ height: 12 }} />
        {loading ? <ActivityIndicator style={{ marginTop: 12 }} /> : null}

        <View style={{ height: 12 }} />

        {positions.length === 0 ? (
          <Text style={{ color: "#94a3b8" }}>Nenhuma posição encontrada. Adicione via "Simular Compra".</Text>
        ) : (
          <FlatList
            data={positions}
            keyExtractor={(i) => i.timestamp.toString()}
            renderItem={({ item }) => (
              <View style={styles.positionRow}>
                <View>
                  <Text style={{ color: "#fff", fontWeight: "700" }}>{item.name} ({item.symbol.toUpperCase()})</Text>
                  <Text style={{ color: "#94a3b8" }}>{item.quantity}x • Entrada R$ {numberToBRL(item.entryPrice)}</Text>
                </View>
                <Text style={{ color: "#94a3b8", alignSelf: "center" }}>{new Date(item.timestamp).toLocaleString()}</Text>
              </View>
            )}
          />
        )}

        <View style={{ height: 12 }} />
        <TouchableOpacity style={styles.primaryButton} onPress={exportJSON}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Exportar carteira (SecureStore)</Text>
        </TouchableOpacity>
        <View style={{ height: 8 }} />
        <TouchableOpacity style={styles.secondaryButton} onPress={clear}>
          <Text style={{ color: "#fff" }}>Limpar carteira</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Tela do perfil
function ProfileScreen() {
  const [expoId, setExpoId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setExpoId(Constants.expoConfig?.slug ?? "unknown");
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: 16 }}>
        <Text style={styles.title}>Perfil</Text>
        <Text style={styles.subtitle}>CriptoNow — Configurações</Text>
        <View style={{ height: 12 }} />
        <Text style={{ color: "#94a3b8" }}>ID do app (Constants): {expoId}</Text>
        <View style={{ height: 12 }} />
        <Text style={{ color: "#94a3b8" }}>Aqui você poderia configurar alertas de preço, tema e exportar/importar carteira.</Text>
      </View>
    </SafeAreaView>
  );
}

// ====== Components =======

// Card para exibir moeda na lista
function CoinCard({ coin, onPress, onFavorite, favorite }: { coin: Coin; onPress?: () => void; onFavorite?: () => void; favorite?: boolean }) {
  const up = coin.price_change_percentage_24h >= 0;
  return (
    <TouchableOpacity style={styles.coinCard} onPress={onPress}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image source={{ uri: coin.image }} style={{ width: 40, height: 40, marginRight: 12 }} />
        <View>
          <Text style={{ color: "#fff", fontWeight: "700" }}>{coin.name}</Text>
          <Text style={{ color: "#94a3b8" }}>{coin.symbol.toUpperCase()}</Text>
        </View>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ color: "#fff", fontWeight: "700" }}>R$ {numberToBRL(coin.current_price)}</Text>
        <TouchableOpacity onPress={onFavorite} style={{ marginTop: 6 }}>
          <Text style={{ color: up ? "#16a34a" : "#dc2626" }}>{coin.price_change_percentage_24h?.toFixed(2)}% {favorite ? "★" : "☆"}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// Componente de gráfico (LineChart)
function PriceChart({ data }: { data: number[] }) {
  const labels = data.length > 6 ? data.map((_, i) => (i % Math.ceil(data.length / 6) === 0 ? `${i}` : "")) : data.map((_, i) => `${i}`);
  const chartData = {
    labels,
    datasets: [{ data }],
  };
  return (
    <LineChart
      data={chartData}
      width={SCREEN_WIDTH - 32}
      height={220}
      withDots={false}
      withShadow={true}
      withInnerLines={false}
      withOuterLines={false}
      yAxisLabel="R$ "
      chartConfig={{
        backgroundGradientFrom: "#030712",
        backgroundGradientTo: "#030712",
        decimalPlaces: 2,
        color: (opacity = 1) => `rgba(99,102,241, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(148,163,184, ${opacity})`,
        propsForBackgroundLines: { strokeDasharray: "" },
      }}
      style={{ borderRadius: 12 }}
    />
  );
}

// ====== Utilitários ======

function numberToBRL(num: number) {
  try {
    return Number(num).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } catch {
    return num.toFixed(2);
  }
}

function formatShortNumber(num: number) {
  if (!num) return "—";
  if (num >= 1.0e12) return (num / 1.0e12).toFixed(2) + "T";
  if (num >= 1.0e9) return (num / 1.0e9).toFixed(2) + "B";
  if (num >= 1.0e6) return (num / 1.0e6).toFixed(2) + "M";
  if (num >= 1.0e3) return (num / 1.0e3).toFixed(2) + "K";
  return num.toString();
}

// *Estilos*
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#030712" },
  title: { color: "#fff", fontSize: 22, fontWeight: "800" },
  subtitle: { color: "#94a3b8", marginTop: 4 },
  coinCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    marginVertical: 6,
    backgroundColor: "#071129",
    borderRadius: 12,
  },
  searchInput: {
    backgroundColor: "#071129",
    color: "#fff",
    padding: 10,
    borderRadius: 10,
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#0f172a",
    padding: 12,
    borderRadius: 10,
    borderColor: "#1f2937",
    borderWidth: 1,
    alignItems: "center",
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(2,6,23,0.7)", justifyContent: "center", alignItems: "center" },
  modalBox: { width: "90%", backgroundColor: "#f8fafc", borderRadius: 12, padding: 16 },
  modalBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginLeft: 8, backgroundColor: "#e2e8f0" },
  positionRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#071129" },

  largePrice: { 
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    marginBottom: 5,
  },
});

// Export default AppRoot para o entry point do Expo
export default AppRoot;
