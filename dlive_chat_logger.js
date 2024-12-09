const WebSocket = require("ws");

const channel = "";

console.log("Dlive chatlogger is started");

let streamer;

/// GET CHANNEL ID/USERNAME
fetch("https://graphigo.prd.dlive.tv/", {
  method: "POST",
  body: JSON.stringify(
    {"operationName":"LivestreamPage",
      "variables":
      {"displayname": `${channel}`,
        "add":false,
        "isLoggedIn":false,
        "isMe":false,
        "showUnpicked":false,
        "order":"PickTime"},
        "extensions":{
            "persistedQuery":{"version":1,
                "sha256Hash":"2e6216b014c465c64e5796482a3078c7ec7fbc2742d93b072c03f523dbcf71e2"}
        }
    }
  )  
}).then(res => {
  if (!res.ok) {
        throw new Error(`Network response was not OK: ${res.status} (${res.statusText})`);
  }
     return res.json()
})
.then(data => {
    if (data.data.userByDisplayName === null) {
    throw new Error(`Wrong name channel or channel doesn't exist`);
    }

   streamer = data.data.userByDisplayName.username;

const dlive = new WebSocket(
    "wss://graphigostream.prd.dlive.tv/", [ 'graphql-ws' ]
  );

/// CONNECTION
dlive.on("open", function open() {

  console.log(`Dlive ${streamer} open connection..`)
    dlive.send(
      JSON.stringify(
        {"type":"connection_init","payload":{}},         
      )
    );
    dlive.send(
      JSON.stringify(        
        {"id":"1",
            "type":"start",
            "payload":{"variables":{"streamer":`${streamer}`},
            "extensions":{"persistedQuery":
                {"version":1,"sha256Hash":"68ad3a464ae2f860541e98dfe28a64756ef772811d2307298f0fb865b5593566"}},
                "operationName":"TreasureChestMessageReceived",
                "query":"subscription TreasureChestMessageReceived($streamer: String!) {\n  treasureChestMessageReceived(streamer: $streamer) {\n    type\n    ... on TreasureChestGiveawayEnded {\n      type\n      nextGiveawayThresholdAt\n      __typename\n    }\n    ... on TreasureChestValueExpired {\n      type\n      expireAt\n      value\n      __typename\n    }\n    ... on TreasureChestGiveawayStarted {\n      type\n      endTime\n      pricePool\n      durationInSeconds\n      __typename\n    }\n    ... on TreasureChestReadyToCollect {\n      type\n      __typename\n    }\n    ... on TreasureChestValueUpdated {\n      type\n      value\n      __typename\n    }\n    __typename\n  }\n}\n"}}     
      )
    );
    dlive.send(
        JSON.stringify(
          {"id":"2","type":"start","payload":{"variables":{"streamer":`${streamer}`,"viewer":""},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"1246db4612a2a1acc520afcbd34684cdbcebad35bcfff29dcd7916a247722a7a"}},"operationName":"StreamMessageSubscription","query":"subscription StreamMessageSubscription($streamer: String!, $viewer: String) {\n  streamMessageReceived(streamer: $streamer, viewer: $viewer) {\n    type\n    ... on ChatGift {\n      id\n      gift\n      amount\n      message\n      recentCount\n      expireDuration\n      ...VStreamChatSenderInfoFrag\n      __typename\n    }\n    ... on ChatHost {\n      id\n      viewer\n      ...VStreamChatSenderInfoFrag\n      __typename\n    }\n    ... on ChatSubscription {\n      id\n      month\n      ...VStreamChatSenderInfoFrag\n      __typename\n    }\n    ... on ChatExtendSub {\n      id\n      month\n      length\n      ...VStreamChatSenderInfoFrag\n      __typename\n    }\n    ... on ChatChangeMode {\n      mode\n      __typename\n    }\n    ... on ChatText {\n      id\n      emojis\n      content\n      createdAt\n      subLength\n      ...VStreamChatSenderInfoFrag\n      __typename\n    }\n    ... on ChatSubStreak {\n      id\n      ...VStreamChatSenderInfoFrag\n      length\n      __typename\n    }\n    ... on ChatClip {\n      id\n      url\n      ...VStreamChatSenderInfoFrag\n      __typename\n    }\n    ... on ChatFollow {\n      id\n      ...VStreamChatSenderInfoFrag\n      __typename\n    }\n    ... on ChatDelete {\n      ids\n      __typename\n    }\n    ... on ChatBan {\n      id\n      ...VStreamChatSenderInfoFrag\n      bannedBy {\n        id\n        displayname\n        __typename\n      }\n      bannedByRoomRole\n      __typename\n    }\n    ... on ChatModerator {\n      id\n      ...VStreamChatSenderInfoFrag\n      add\n      __typename\n    }\n    ... on ChatEmoteAdd {\n      id\n      ...VStreamChatSenderInfoFrag\n      emote\n      __typename\n    }\n    ... on ChatTimeout {\n      id\n      ...VStreamChatSenderInfoFrag\n      minute\n      bannedBy {\n        id\n        displayname\n        __typename\n      }\n      bannedByRoomRole\n      __typename\n    }\n    ... on ChatTCValueAdd {\n      id\n      ...VStreamChatSenderInfoFrag\n      amount\n      totalAmount\n      __typename\n    }\n    ... on ChatGiftSub {\n      id\n      ...VStreamChatSenderInfoFrag\n      count\n      receiver\n      __typename\n    }\n    ... on ChatGiftSubReceive {\n      id\n      ...VStreamChatSenderInfoFrag\n      gifter\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment VStreamChatSenderInfoFrag on SenderInfo {\n  subscribing\n  role\n  roomRole\n  sender {\n    id\n    username\n    displayname\n    avatar\n    partnerStatus\n    badges\n    effect\n    __typename\n  }\n  __typename\n}\n"}}         
        )
    );
});

/// EVENTS
dlive.addEventListener('message', function (event) {
    
    let data = JSON.parse(event.data);
    if (data.type === "connection_ack") {
    return console.log(`Connected to Dlive ${streamer} chat`);
    }
    if (data.type === "ka") {return}
    if (data.payload?.data?.streamMessageReceived === undefined) {return}

    let msg = data.payload?.data?.streamMessageReceived[0];

    //Chat Message
    if (msg?.type === "Message" && msg.__typename === 'ChatText') {
    return    console.log(`${msg.sender.displayname} ${msg.content}`);
      }
    //Gift
    if (msg?.type === 'Gift' &&  msg.__typename === 'ChatGift') {
    return  console.log(`${msg.sender.displayname} gives ${msg.amount} ${msg.gift}`);
    }
    //Follow
    if (msg?.type === 'Follow' && msg?.__typename === 'ChatFollow') {
    return  console.log(`${msg.sender.displayname} is now following!`);
    }
    //Host
    if (msg?.type === 'Host' && msg.__typename === 'ChatHost') {
    return  console.log(`${msg.sender.displayname} hosts channel with ${msg.viewer} viewers!`);
    }
    //Moderator promotion
    if (msg?.type === 'Mod' && msg.__typename === 'ChatModerator') {
    return  console.log(`${msg.sender.displayname} was promoted to ${msg.roomRole}`);
    }
    //Ban
    if (msg?.type === 'Ban' && msg.__typename === 'ChatBan') {
    return  console.log(`${msg.roomRole} '${msg.sender.displayname}' has been banned by ${msg.bannedBy.displayname}`);
    }
    //Message deleted
    if (msg?.type === 'Delete' && msg?.__typename === 'ChatDelete') {
    return  console.log(`Message deleted ${msg.ids}`);
    }

  });

  dlive.on("error", console.error);

});
