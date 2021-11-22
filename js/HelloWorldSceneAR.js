'use strict';

import React, { Component } from 'react';
import {StyleSheet} from 'react-native';

import {
  ViroARScene,
  ViroText,
  ViroConstants,
  ViroAmbientLight,
  ViroSpotLight,
  Viro3DObject,
  ViroMaterials,
  ViroARPlaneSelector,
  ViroNode,
  ViroFlexView,
  ViroController,
  ViroQuad,
  ViroOrbitCamera
} from 'react-viro';

export default class HelloWorldSceneAR extends Component {

  constructor() {
    super();

    this.state = {
      text : "Initializing AR...",
      paused: false,
      enableDice: false,
      orbitPosition: [0,0,0],
      orbitFocal: [0, 0, -1],
      orbitActive: false
    };

    this._onInitialized = this._onInitialized.bind(this);
  }

  render() {
    this.diceProperties = {
      type:'Dynamic', mass:1, restitution: 0.2, enabled: this.state.enableDice,shape: {type: "Compound"}
    }

    return (
      <ViroARScene onTrackingUpdated={this._onInitialized} physicsWorld={{ gravity:[0,-9.81,0]}} anchorDetectionTypes={"PlanesHorizontal"}>
        <ViroText text={this.state.text} scale={[.1, .1, .1]} height={1} width={4} position={[0, .5, -1]} style={styles.helloWorldTextStyle} />
       
        <ViroAmbientLight color={"#aaaaaa"} intensity={10}/>
        <ViroSpotLight innerAngle={5} outerAngle={90} direction={[0,-1,-.2]} position={[0, 3, 1]} color="#ffffff" castsShadow={true} />

        <ViroARPlaneSelector
        pauseUpdates={this.state.paused}> 

          {this._getHUDControl()}
          <ViroController />

          <Viro3DObject
            ref={(obj)=>{this.dice = obj}}
            source={require('./diceFolder/BoneDice/Bone_Dice.obj')}
            position={[0, 2, -1]}
            scale={[0.8, 0.8, 0.8]}
            type="OBJ"
            viroTag={'dice'}
            onClick={this._throwDice.bind(this)}
            physicsBody={this.diceProperties}
            materials={['diceMaterial']}
          />
          
          <ViroOrbitCamera position={this.state.orbitPosition} focalPoint={this.state.orbitFocal} active={this.state.orbitActive} />

          <ViroQuad position={[0,0,-3]} scale={[20, 20, 1]} rotation={[-90, 0, 0]} physicsBody={{ type:'Static', restitution:0.1, friction:2 }}
            ref={(component)=>{this.floorSurface = component}} materials={'ground'}/>
        </ViroARPlaneSelector>
      </ViroARScene>
    );
  }

  _getHUDControl() {
    return(
      <ViroNode position={[0, 1.5, -4]} transformBehaviors={["billboardX", "billboardY"]}>
      <ViroFlexView style={{flexDirection: 'column'}} width={0.8} height={0.5} materials="hud_text_bg" position={[0,0,0]} onClick={this._resetScene.bind(this)}>
        <ViroText style={styles.hud_text}  text={"Reset scene"} />
      </ViroFlexView>

      <ViroFlexView style={{flexDirection: 'column'}} width={0.8} height={0.5} materials="hud_text_bg" position={[-1.5,0,0]} onClick={this._watchDice.bind(this)}>
        <ViroText style={styles.hud_text}  text={"See result"} />
      </ViroFlexView>
    </ViroNode>
    )
  }

  _watchDice() {
    
    this.dice.getTransformAsync().then((diceTransform)=>{
      var pos = diceTransform.position;

      this.setState({
        orbitPosition: [pos[0], pos[1]+1.5, pos[2]],
        orbitFocal: [pos[0], pos[1], pos[2]],
        orbitActive: true
      })
    })


  }

  _throwDice() {
    this.setState({enableDice:true});
    this.dice.getTransformAsync().then((diceTransform)=>{
      var randX = this._randomNumber(0.1, 0.4)
      var randY = this._randomNumber(0.1, 0.5)
      var randZ = this._randomNumber(0.1, 0.3)
      
      var pos = diceTransform.position;
      var pushImpulse = [randX, randY, randZ]

      var pushPosition = [pos[0], pos[0], 0]
      this.dice.applyImpulse(pushImpulse, pushPosition)
    })
    
  }
  _randomNumber(min, max) { 
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
} 
  _resetScene() {

    setTimeout(() => {
      this.dice.setNativeProps({"physicsBody":null});
      this.dice.setNativeProps({"position":[0, 2, -1]});
      
      setTimeout(() => {
        this.dice.setNativeProps({"physicsBody":this.ballProperties});
      }, 400);

    }, 400);
    this.setState({enableDice:false, orbitActive: false});
  }

  _onInitialized(state, reason) {
    if (state == ViroConstants.TRACKING_NORMAL) {
      this.setState({
        text : "Dice Game!"
      });
    } else if (state == ViroConstants.TRACKING_NONE) {
      this.setState({
        text : "Lost Track"
      });
    }
  }
}

var styles = StyleSheet.create({
  helloWorldTextStyle: {
    fontFamily: 'Arial',
    fontSize: 30,
    color: '#ffffff',
    textAlignVertical: 'center',
    textAlign: 'center',  
  },
  hud_text: {
    fontSize: 14,
    fontFamily: 'Arial',
    color: '#0000ff',
    flex: 1,
},
});

ViroMaterials.createMaterials({
  ground:{
    diffuseColor: "#007CB6E6"
  },
  hud_text_bg: {
    diffuseColor: "#00ffff"
  },
  diceMaterial: {
    lightingModel: 'Constant',
    diffuseTexture: require('./diceFolder/BoneDice/Dice_Base_Color.png')
  }
})
module.exports = HelloWorldSceneAR;
