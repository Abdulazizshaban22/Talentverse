import { Text, View, Pressable } from 'react-native';
export default function App(){
  return <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
    <Text style={{fontSize:20, marginBottom:12}}>تالنت فيرس — الجوال</Text>
    <Pressable onPress={()=>{}}><Text>تسجيل الدخول</Text></Pressable>
  </View>
}
