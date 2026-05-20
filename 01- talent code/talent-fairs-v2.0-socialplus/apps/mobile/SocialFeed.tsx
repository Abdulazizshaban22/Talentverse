import { useEffect, useState } from 'react'
import { View, Text, FlatList, TextInput, Pressable } from 'react-native'
export default function SocialFeed({ token, userId }:{ token?:string|null, userId?:string|null }){
  const [posts, setPosts] = useState<any[]>([])
  const [text, setText] = useState('')
  const API = 'http://localhost:4000'
  async function load(){ const r = await fetch(`${API}/feed?userId=${userId}`, { headers: token? { Authorization: `Bearer ${token}` } : {} }); setPosts(await r.json()) }
  async function create(){ const r = await fetch(`${API}/posts/create`,{ method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ text })}); if(r.ok){ setText(''); load() } }
  useEffect(()=>{ if(token) load() },[token])
  return <View style={{flex:1, padding:16}}>
    <View style={{borderWidth:1, borderRadius:8, padding:12, marginBottom:12}}>
      <TextInput placeholder="اكتب منشورًا..." value={text} onChangeText={setText} />
      <Pressable onPress={create}><Text>نشر</Text></Pressable>
    </View>
    <FlatList data={posts} keyExtractor={i=>i.id} renderItem={({item})=>(<View style={{borderWidth:1, borderRadius:8, padding:12, marginBottom:8}}><Text style={{color:'#666', fontSize:12}}>{new Date(item.createdAt).toLocaleString()}</Text><Text>{item.text}</Text></View>)} />
  </View>
}
