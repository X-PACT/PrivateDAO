function sleep(ms){
  return new Promise(resolve=>setTimeout(resolve,ms));
}

async function pulse(bot,chatId,title,steps){
  const msg=await bot.sendMessage(
    chatId,
    `${title}\n\n⏳ Preparing...`,
    {disable_web_page_preview:true}
  );

  for(const step of steps){
    await sleep(450);

    try{
      await bot.editMessageText(
`${title}

${step}`,
{
chat_id:chatId,
message_id:msg.message_id,
disable_web_page_preview:true
}
      );
    }catch(e){}
  }

  return msg;
}

module.exports={
  pulse
};
