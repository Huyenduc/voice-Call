/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import 'react-native-gesture-handler';
import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  useColorScheme
} from 'react-native';

import { API_URL } from '@env';
import {
  checkMultiple,
  request,
  requestMultiple,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import {
  TwilioVideoLocalView,
  TwilioVideoParticipantView,
  TwilioVideo,
} from 'react-native-twilio-video-webrtc';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MateriaLicons from 'react-native-vector-icons/MaterialIcons';

const Stack = createStackNavigator();

interface Iprops {
  props: IinitialState,
  setProps: any
}

interface IinitialState {
  isAudioEnabled: boolean,
  isVideoEnabled: boolean,
  status: string,
  participants: Map<any, any>,
  videoTracks: Map<any, any>,
  userName: string,
  roomName: string,
  token: string,
}

const initialState: IinitialState = {
  isAudioEnabled: true,
  isVideoEnabled: true,
  status: 'disconnected',
  participants: new Map(),
  videoTracks: new Map(),
  userName: '',
  roomName: '',
  token: '',
};

const AppContext = React.createContext<Iprops>({ props: initialState, setProps: null });
const dimensions = Dimensions.get('window');
const App = () => {
  const [props, setProps] = useState(initialState);

  // console.log("nxeeww", props.token)
  console.log("news", API_URL)


  return (
    <>
      <StatusBar barStyle="dark-content" />
      <AppContext.Provider value={{ props, setProps }}>
        <NavigationContainer >
          <Stack.Navigator screenOptions={{headerShown:false}} >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Video Call" component={VideoCallScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppContext.Provider>
    </>
  );
};

const HomeScreen = ({ navigation }: any) => {
  const { props, setProps } = useContext(AppContext);

  const _checkPermissions = (callback?: any) => {
    const iosPermissions = [PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.MICROPHONE];
    const androidPermissions = [
      PERMISSIONS.ANDROID.CAMERA,
      PERMISSIONS.ANDROID.RECORD_AUDIO,
    ];
    checkMultiple(
      Platform.OS === 'ios' ? iosPermissions : androidPermissions,
    ).then((statuses) => {
      const [CAMERA, AUDIO] =
        Platform.OS === 'ios' ? iosPermissions : androidPermissions;
      if (
        statuses[CAMERA] === RESULTS.UNAVAILABLE ||
        statuses[AUDIO] === RESULTS.UNAVAILABLE
      ) {
        Alert.alert(
          'Error',
          'Hardware to support video calls is not available',
        );
      } else if (
        statuses[CAMERA] === RESULTS.BLOCKED ||
        statuses[AUDIO] === RESULTS.BLOCKED
      ) {
        Alert.alert(
          'Error',
          'Permission to access hardware was blocked, please grant manually',
        );
      } else {
        if (
          statuses[CAMERA] === RESULTS.DENIED &&
          statuses[AUDIO] === RESULTS.DENIED
        ) {
          requestMultiple(
            Platform.OS === 'ios' ? iosPermissions : androidPermissions,
          ).then((newStatuses) => {
            if (
              newStatuses[CAMERA] === RESULTS.GRANTED &&
              newStatuses[AUDIO] === RESULTS.GRANTED
            ) {
              callback && callback();
            } else {
              Alert.alert('Error', 'One of the permissions was not granted');
            }
          });
        } else if (
          statuses[CAMERA] === RESULTS.DENIED ||
          statuses[AUDIO] === RESULTS.DENIED
        ) {
          request(statuses[CAMERA] === RESULTS.DENIED ? CAMERA : AUDIO).then(
            (result) => {
              if (result === RESULTS.GRANTED) {
                callback && callback();
              } else {
                Alert.alert('Error', 'Permission not granted');
              }
            },
          );
        } else if (
          statuses[CAMERA] === RESULTS.GRANTED ||
          statuses[AUDIO] === RESULTS.GRANTED
        ) {
          callback && callback();
        }
      }
    });
  };

  useEffect(() => {
    _checkPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.text}>User Name</Text>
            <TextInput
              style={styles.textInput}
              autoCapitalize="none"
              value={props.userName}
              onChangeText={(text) => setProps({ ...props, userName: text })}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.text}>Room Name</Text>
            <TextInput
              style={styles.textInput}
              autoCapitalize="none"
              value={props.roomName}
              onChangeText={(text) => setProps({ ...props, roomName: text })}
            />
          </View>
          <View style={styles.formGroup}>
            <TouchableOpacity
              disabled={false}
              style={styles.button}
              onPress={() => {
                _checkPermissions(() => {
                  fetch(`${API_URL}api/rooms/getToken/hj`)
                    .then((response) => {
                      if (response.ok) {
                        response.text().then((jwt) => {
                        console.log(jwt)

                          setProps({ ...props, token: jwt });
                          navigation.navigate('Video Call');
                          return true;
                        });
                      } else {
                        response.text().then((error) => {
                          Alert.alert(error);
                        });
                      }
                    })
                    .catch((error) => {
                      console.log('error', error);
                      Alert.alert('API not available');
                    });
                });
              }}>
              <Text style={styles.buttonText}>Connect to Video Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const VideoCallScreen = ({ navigation }: any) => {
  const twilioVideo = useRef<any>(null);
  // console.log("ok1", twilioVideo)

  const [open, setOpen] = useState(true)

  const { props, setProps } = useContext(AppContext);

  useEffect(() => {
    twilioVideo.current.connect({
      // roomName: props.roomName,
      accessToken:props.token,
      // enableVideo:videoLocal,
      region: 'gll',
      bandwidthProfile: {
        video: {
          mode: 'grid',
          maxSubscriptionBitrate: 2500000,
          dominantSpeakerPriority: 'standard'
        }
      },
      dominantSpeaker: true,
      dominantSpeakerPriority: 'high',
      maxAudioBitrate: 16000, //For music remove this line
      preferredVideoCodecs: [{ codec: 'VP8', simulcast: true }],
      networkQuality: { local: 1, remote: 2 }
    });
    // console.log("ok", twilioVideo.current)
    setProps({ ...props, status: 'connecting' });
    return () => {
      _onEndButtonPress();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _onEndButtonPress = () => {
    twilioVideo.current.disconnect();
    setProps(initialState);
  };

  const _onMuteButtonPress = () => {
    twilioVideo.current
      .setLocalAudioEnabled(!props.isAudioEnabled)
      .then((isEnabled: any) => setProps({ ...props, isAudioEnabled: isEnabled }));
  };

  const _onFlipButtonPress = () => {
    twilioVideo.current.flipCamera();

  };

  const _onDisableVideoButtonPress = () => {
    twilioVideo.current
    .setLocalVideoEnabled(!props.isVideoEnabled)
    .then((isEnabled: any) => setProps({...props, isVideoEnabled: isEnabled }))
  }

  return (
    <View style={styles.callContainer}>

      <View style={{ flex: 1, marginBottom: '10%' }}>
        {(props.status === 'connected' || props.status === 'connecting') && (
          <View style={styles.callWrapper}>
            {props.status === 'connected' && (
              <View style={styles.remoteGrid}>
                {Array.from(props.videoTracks, ([trackSid, trackIdentifier]) => (
                  <TwilioVideoParticipantView
                    style={styles.remoteVideo}
                    key={trackSid}
                    trackIdentifier={trackIdentifier}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        <TwilioVideoLocalView
          enabled={props.status === 'connected'}

          applyZOrder={true}
          style={styles.localVideo}
        />

      </View>


      {
        open ?
          <View style={styles.optionsContainer}>
            <View>
            <TouchableOpacity onPress={() => setOpen(!open)} >
              <FontAwesome name="minus" size={30} color="red" />
            </TouchableOpacity>
            </View>
            <View style={styles.optionsbutton}>
              <TouchableOpacity style={[styles.button, { backgroundColor: '#ed3b2d', marginLeft: 10 }]} onPress={_onEndButtonPress}>

                <MateriaLicons name="call-end" size={30} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={_onMuteButtonPress}>
                <MateriaLicons name={props.isAudioEnabled ? 'mic' : 'mic-off'} size={30} color="white" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={_onDisableVideoButtonPress}>
                <MateriaLicons name={props.isVideoEnabled ? 'videocam' : 'videocam-off'} size={30} color="white" />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, { marginRight: 10 }]} onPress={_onFlipButtonPress}>
                {/* <Text style={styles.buttonText}>Flip</Text> */}
                <MateriaLicons name="flip-camera-ios" size={30} color="white" />
              </TouchableOpacity>
            </View>

          </View> :
          <View>
            <TouchableOpacity onPress={() => setOpen(!open)} >
              <FontAwesome name="minus" size={30} color="red" />
            </TouchableOpacity>
          </View>
      }

      <TwilioVideo
        ref={twilioVideo}
        onRoomDidConnect={() => {
          setProps({ ...props, status: 'connected' });
        }}
        onRoomDidDisconnect={() => {
          setProps({ ...props, status: 'disconnected' });
          navigation.goBack();
        }}
        onRoomDidFailToConnect={(error) => {
          Alert.alert('Error', error.error);
          setProps({ ...props, status: 'disconnected' });
          navigation.goBack();
        }}
        onParticipantAddedVideoTrack={({ participant, track }) => {
          if (track.enabled) {
            setProps({
              ...props,
              videoTracks: new Map([
                ...props.videoTracks,
                [
                  track.trackSid,
                  {
                    participantSid: participant.sid,
                    videoTrackSid: track.trackSid,
                  },
                ],
              ]),
            });
          }
        }}
        onParticipantRemovedVideoTrack={({ track }) => {
          const videoTracks = props.videoTracks;
          videoTracks.delete(track.trackSid);
          setProps({ ...props, videoTracks });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightgrey',
    flexDirection: 'row',
  },
  form: {
    flex: 1,
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 20,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  formGroup: {
    margin: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    padding: 10,
    backgroundColor: '#4a4a4a',
    borderRadius: 50,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  textInput: {
    padding: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'lightgrey',
  },
  callContainer: {
    flex: 1,
  },
  callWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  remoteGrid: {
    flex: 1,
  },
  remoteVideo: {
    flex: 1,
  },
  localVideo: {
    borderRadius: 30,
    position: 'absolute',
    right: 20,
    top: 30,
    width: dimensions.width / 4,
    height: dimensions.height / 4,
  },

  optionsContainer:{
    backgroundColor: '#333333',
    height:"12%",
    
    
  },
  optionsbutton: {
    
    flex: 1,
    padding: 20,
    position: 'absolute',
    paddingHorizontal: 10,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: {
    color: "red"
  }
});

export default App;