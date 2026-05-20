import { Text, View, Pressable, FlatList } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import { useState } from 'react';

const KEYCLOAK_ISSUER = process.env.EXPO_PUBLIC_KEYCLOAK_ISSUER || 'http://localhost:8080/realms/talent'
const CLIENT_ID = process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID || 'mobile'
const REDIRECT_URI = AuthSession.makeRedirectUri({ scheme: 'talentfairs' })
const DISCOVERY = {
  authorizationEndpoint: `${KEYCLOAK_ISSUER}/protocol/openid-connect/auth`,
  tokenEndpoint: `${KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
  revocationEndpoint: `${KEYCLOAK_ISSUER}/protocol/openid-connect/revoke`,
}

export default function App(){
  const [token, setToken] = useState<string | null>(null)
  const [rewards, setRewards] = useState<any[]>([])

  const login = async ()=>{
    const request = new AuthSession.AuthRequest({
      clientId: CLIENT_ID,
      responseType: AuthSession.ResponseType.Code,
      scopes: ['openid','profile','email'],
      redirectUri: REDIRECT_URI,
      usePKCE: true,
    })
    await request.makeAuthUrlAsync(DISCOVERY)
    const result = await request.promptAsync(DISCOVERY, { useProxy: false })
    if (result.type === 'success' && result.params.code){
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: result.params.code as string,
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code_verifier: request.codeVerifier!,
      }).toString()
      const r = await fetch(DISCOVERY.tokenEndpoint, { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body })
      const j = await r.json()
      setToken(j.access_token)
    }
  }

  const loadRewards = async ()=>{
    const r = await fetch('http://localhost:4000/rewards', { headers: token? { Authorization: `Bearer ${token}` } : {} })
    setRewards(await r.json())
  }

  return <View style={{flex:1, paddingTop:80, paddingHorizontal:16}}>
    <Text style={{fontSize:20, marginBottom:12}}>تالنت فيرس — الجوال</Text>
    <Pressable onPress={login} style={{marginBottom:12}}><Text>تسجيل الدخول (Keycloak)</Text></Pressable>
    <Pressable onPress={loadRewards} style={{marginBottom:12}}><Text>تحميل المتجر</Text></Pressable>
    <FlatList data={rewards} keyExtractor={i=>i.id} renderItem={({item})=>(
      <View style={{padding:12, borderWidth:1, borderRadius:8, marginBottom:8, flexDirection:'row', justifyContent:'space-between'}}>
        <View><Text style={{fontWeight:'bold'}}>{item.title}</Text><Text>النقاط: {item.cost} / المخزون: {item.stock}</Text></View>
        <Text>استبدال</Text>
      </View>
    )}/>
  </View>
}
