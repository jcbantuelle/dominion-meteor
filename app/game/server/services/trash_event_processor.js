TrashEventProcessor = class BuyEventProcessor {

  static reaction_cards() {
    return ['Market Square']
  }

  static event_cards() {
    return ['Overgrown Estate', 'Squire', 'Feodum']
  }

  constructor(trasher, card) {
    this.trasher = trasher
    this.card = card
    this.find_trash_events()
  }

  find_trash_events() {
    this.trash_events = []
    if (_.contains(TrashEventProcessor.event_cards(), this.card.name)) {
      this.trash_events.push(this.card)
    }

    _.each(this.trasher.player_cards.hand, (card) => {
      if (_.contains(TrashEventProcessor.reaction_cards(), card.name)) {
        this.trash_events.push(card)
      }
    })
  }

  process() {
    if (!_.isEmpty(this.trash_events)) {
      let mandatory_trash_events = _.filter(this.trash_events, function(event) {
        return _.contains(TrashEventProcessor.event_cards(), event.name)
      })
      if (_.size(this.trash_events) === 1 && !_.isEmpty(mandatory_trash_events)) {
        TrashEventProcessor.trash_event(this.trasher.game, this.trasher.player_cards, this.trash_events, this)
      } else {
        GameModel.update(this.trasher.game._id, this.trasher.game)
        let instructions = `Choose Trash Event To Resolve for ${CardView.render(this.card)}`
        let minimum = 1
        if (_.isEmpty(mandatory_trash_events)) {
          instructions += ' (Or none to skip)'
          minimum = 0
        }
        let turn_event_id = TurnEventModel.insert({
          game_id: this.trasher.game._id,
          player_id: this.trasher.player_cards.player_id,
          username: this.trasher.player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: `${instructions}:`,
          cards: this.trash_events,
          minimum: minimum,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(this.trasher.game, this.trasher.player_cards, turn_event_id, this)
        turn_event_processor.process(TrashEventProcessor.trash_event)
      }
    }
  }

  static trash_event(game, player_cards, selected_cards, trash_event_processor) {
    if (!_.isEmpty(selected_cards)) {
      let selected_card = ClassCreator.create(selected_cards[0].name)
      if (_.contains(TrashEventProcessor.reaction_cards(), selected_card.name())) {
        selected_card.trash_reaction(game, player_cards, trash_event_processor.trasher)
        if (selected_cards[0].name === 'Market Square') {
          let trash_event_index = _.findIndex(trash_event_processor.trash_events, function(event) {
            return event.name === 'Market Square'
          })
          trash_event_processor.trash_events.splice(trash_event_index, 1)
        }
      } else {
        selected_card.trash_event(trash_event_processor.trasher)
        let trash_event_index = _.findIndex(trash_event_processor.trash_events, function(event) {
          return event.name === selected_cards[0].name
        })
        trash_event_processor.trash_events.splice(trash_event_index, 1)
      }

      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      trash_event_processor.process()
    }
  }

}
