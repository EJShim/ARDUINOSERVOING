function E_Interactor(Mgr)
{
  this.Mgr = Mgr;

  this.m_bUp = false;
  this.m_bDown = false;
  this.m_bR = false;
  this.m_bL = false;
  this.m_bSpace = false;
}


E_Interactor.prototype.Update = function()
{
  if(this.m_bUp){
    this.Mgr.SocketMgr().EmitData("SIGNAL_LOOKUP", null);
  }

  if(this.m_bDown){
    this.Mgr.SocketMgr().EmitData("SIGNAL_LOOKDOWN", null);
  }

  if(this.m_bR){
    this.Mgr.SocketMgr().EmitData("SIGNAL_LOOKRIGHT", null);
  }

  if(this.m_bL){
    this.Mgr.SocketMgr().EmitData("SIGNAL_LOOKLEFT", null);
  }

  if(this.m_bSpace){
    this.Mgr.SocketMgr().EmitData("SIGNAL_INITIALIZE", null);
  }
}

module.exports = E_Interactor;
