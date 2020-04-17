CardBuyer = class CardBuyer {

  constructor(game, player_cards, card_name) {
    this.game = game
    this.player_cards = player_cards
    if (card_name) {
      this.game_card = _.find(this.game.cards, function(card) {
        return card.name === card_name
      })
      this.card = this.game_card.top_card
      this.card_gainer = new CardGainer(this.game, this.player_cards, 'discard', card_name, true)
    }
  }

  buy() {
    if (this.can_buy()) {
      this.update_phase()
      this.buy_card()
      GameModel.update(this.game._id, this.game)
      PlayerCardsModel.update(this.game._id, this.player_cards)
    }
  }

  can_buy() {
    return this.is_debt_free() && this.is_purchasable() && this.is_valid_buy() && !this.is_contraband() && !this.game.turn.mission_turn && (!this.game.turn.deluded || !_.includes(_.words(this.card.types), 'action'))
  }

  update_phase() {
    if (_.includes(['action', 'treasure'], this.game.turn.phase)) {
      if (this.game.turn.phase === 'action') {
        let start_buy_event_processor = new StartBuyEventProcessor(this.game, this.player_cards)
        start_buy_event_processor.process()
      }
      this.game.turn.phase = 'buy'
    }
  }

  buy_card() {
    this.update_log()
    this.update_turn()
    this.track_bought_card()
    this.buy_events()
    this.gain_card()
  }

  update_turn() {
    this.game.turn.buys -= 1
    this.game.turn.coins -= CostCalculator.calculate(this.game, this.card, true)
    this.game.turn.potions -= this.card.potion_cost

    if (this.card.debt_cost > 0) {
      let debt_token_gainer = new DebtTokenGainer(this.game, this.player_cards)
      debt_token_gainer.gain(this.card.debt_cost)
    }
  }

  track_bought_card(card) {
    let bought_card = _.clone(this.card)
    this.game.turn.bought_cards.push(bought_card)
  }

  buy_events() {
    let buy_event_processor = new BuyEventProcessor(this)
    buy_event_processor.process()
  }

  gain_card() {
    let gained_card = this.card_gainer.gain()
    if (gained_card && gained_card.id !== this.card.id) {
      this.game.log.push(`&nbsp;&nbsp;<strong>${this.card_gainer.player_cards.username}</strong> gains ${CardView.render(gained_card)} instead`)
    }
  }

  is_debt_free() {
    return this.player_cards.debt_tokens === 0
  }

  is_purchasable() {
    return this.game_card.supply && (this.card.name !== 'Grand Market' || this.allow_grand_market())
  }

  allow_grand_market() {
    let coppers = _.filter(this.player_cards.in_play, function(card) {
      return card.name === 'Copper'
    })
    return _.isEmpty(coppers)
  }

  is_valid_buy() {
    return this.has_remaining_stock() && this.has_enough_buys() && this.has_enough_money()
  }

  is_contraband() {
    return _.includes(this.game.turn.contraband, this.card.name)
  }

  has_remaining_stock() {
    return this.game_card.count > 0
  }

  has_enough_buys() {
    return this.game.turn.buys > 0
  }

  has_enough_money() {
    let coin_cost = CostCalculator.calculate(this.game, this.card, true)
    return this.game.turn.coins >= coin_cost && this.game.turn.potions >= this.card.potion_cost
  }

  update_log() {
    let log_message = `<strong>${this.player_cards.username}</strong> buys ${CardView.render(this.card)}`
    if (this.game.turn.possessed) {
      log_message += ` but <strong>${this.game.turn.possessed.username}</strong> gains it`
    }
    if (this.card_gainer.destination === 'hand') {
      log_message += ', placing it in hand'
    } else if (this.card_gainer.destination === 'deck') {
      log_message += ', placing it on top of their deck'
    }
    this.game.log.push(log_message)
  }

}
