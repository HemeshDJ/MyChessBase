export type OpeningVariation = {
  id: string
  name: string
  sans: string[]
  note: string
}

export type OpeningMistake = {
  id: string
  title: string
  /** Moves leading to the position where the mistake happens. */
  before: string[]
  /** The weak move by the opponent. */
  mistake: string
  /** Best punishing continuation after the mistake. */
  punish: string[]
  why: string
  idea: string
}

export type Opening = {
  id: string
  name: string
  eco: string
  family: string
  forSide: 'white' | 'black' | 'both'
  summary: string
  plans: string[]
  mainLine: OpeningVariation
  variations: OpeningVariation[]
  mistakes: OpeningMistake[]
}

export const OPENINGS: Opening[] = [
  {
    id: 'italian',
    name: 'Italian Game',
    eco: 'C50–C54',
    family: 'Open Games',
    forSide: 'white',
    summary:
      'Quiet development with Bc4, aiming at f7. You can play solid Giuoco Piano lines or sharper ones with c3 and d4.',
    plans: [
      'Castle quickly and fight for the center with c3 and d4.',
      'Pressure f7 and the a2–g8 diagonal.',
      'If Black plays passively, expand with a4/a5 or Ng5 ideas.',
    ],
    mainLine: {
      id: 'italian-main',
      name: 'Giuoco Piano',
      sans: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd4', 'exd4', 'cxd4', 'Bb4+', 'Bd2'],
      note: 'White builds a broad center. After Bb4+, Bd2 asks Black to resolve the tension.',
    },
    variations: [
      {
        id: 'italian-two-knights',
        name: 'Two Knights Defense',
        sans: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6'],
        note: 'Black skips Bc5 and invites sharper play. White can choose quiet d3 or the Max Lange/Fried Liver ideas.',
      },
      {
        id: 'italian-evans',
        name: 'Evans Gambit',
        sans: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4'],
        note: 'A pawn sacrifice for tempo and a strong center. Great for learning initiative.',
      },
    ],
    mistakes: [
      {
        id: 'italian-early-nxe4',
        title: 'Grabbing e4 too early',
        before: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd4', 'exd4', 'cxd4', 'Bb4+', 'Nc3'],
        mistake: 'Nxe4',
        punish: ['O-O', 'Nxc3', 'bxc3', 'Bxc3', 'Ba3'],
        why: 'Black snatches a pawn while undeveloped and king still in the center.',
        idea: 'Castle, open lines, and use Ba3 to cut Black’s king away from castling.',
      },
      {
        id: 'italian-ng5-trap',
        title: 'Ignoring Ng5 against the Two Knights',
        before: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5', 'd5', 'exd5'],
        mistake: 'Nxd5',
        punish: ['Nxf7', 'Kxf7', 'Qf3+', 'Ke6', 'Nc3'],
        why: 'Nxd5 walks into the Fried Liver idea: White sacrifices on f7 and hunts the king.',
        idea: 'After Nxf7 and Qf3+, Black’s king is dragged out; Nc3 piles on the pinned knight.',
      },
    ],
  },
  {
    id: 'ruy-lopez',
    name: 'Ruy Lopez',
    eco: 'C60–C99',
    family: 'Open Games',
    forSide: 'white',
    summary:
      'Bb5 pressures the defender of e5. One of the richest classical openings: slow maneuvering with sudden central breaks.',
    plans: [
      'Castle, play Re1 and c3, then d4.',
      'Keep the light-squared bishop useful on the a2–g8 or b1–h7 diagonal.',
      'In Closed lines, expand on the queenside with a4 and look for d4-d5 or f4 later.',
    ],
    mainLine: {
      id: 'ruy-main',
      name: 'Closed Ruy Lopez',
      sans: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O'],
      note: 'The standard Closed setup. White is ready for d4 while Black has expanded on the queenside.',
    },
    variations: [
      {
        id: 'ruy-exchange',
        name: 'Exchange Variation',
        sans: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Bxc6', 'dxc6'],
        note: 'White damages Black’s structure and aims for an endgame edge with the kingside majority.',
      },
      {
        id: 'ruy-berlin',
        name: 'Berlin Defense',
        sans: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6'],
        note: 'Solid and endgame-heavy. Black often equalizes into a tough queenless position.',
      },
    ],
    mistakes: [
      {
        id: 'ruy-copycat',
        title: 'Copying with …Bb4+',
        before: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'O-O', 'c3', 'd5', 'exd5'],
        mistake: 'Nxd5',
        punish: ['Nxe5', 'Nxe5', 'Rxe5'],
        why: 'Recapturing with the knight allows the famous Ruy tactic on e5.',
        idea: 'Take on e5, and if …Nxe5 then Rxe5 — Black’s hanging pieces collapse.',
      },
      {
        id: 'ruy-early-nxe4',
        title: 'Open Defense: queen grab',
        before: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Nxe4', 'd4'],
        mistake: 'exd4',
        punish: ['Re1', 'd5', 'Nxd4'],
        why: 'Opening the e-file while the king is uncastled lets White pin and recover material with interest.',
        idea: 'Re1 pins along the e-file; Nxd4 restores the pawn and keeps Black cramped.',
      },
    ],
  },
  {
    id: 'sicilian',
    name: 'Sicilian Defense',
    eco: 'B20–B99',
    family: 'Semi-Open',
    forSide: 'black',
    summary:
      '1…c5 is Black’s most ambitious reply to 1.e4. You trade a wing pawn for White’s d-pawn, get an open c-file, and play for unbalanced wins. Learn the Open Sicilian families first, then the anti-Sicilians White uses to dodge theory.',
    plans: [
      'After …cxd4 Nxd4, develop quickly and decide between …d6/…e6/…e5/…g6 structures.',
      'Use the half-open c-file: …Rc8, pressure c2, and expand with …a6/…b5 when safe.',
      'Time the …d5 break — it’s often Black’s equalizer or winning shot.',
      'Against opposite-side castling (especially the Dragon), race; don’t play quiet moves.',
      'Against anti-Sicilians (Alapin, Closed, Smith-Morra, Grand Prix), know one reliable setup each.',
    ],
    mainLine: {
      id: 'sicilian-najdorf',
      name: 'Najdorf',
      sans: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'],
      note:
        'The modern main line. …a6 stops Nb5/Bb5 ideas and prepares …e5, …e6, or …b5. Huge theory, maximum flexibility.',
    },
    variations: [
      {
        id: 'sicilian-dragon',
        name: 'Dragon',
        sans: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6', 'Be3', 'Bg7', 'f3', 'O-O', 'Qd2', 'Nc6'],
        note:
          'Fianchetto pressure on the long diagonal. If White castles queenside (Yugoslav Attack), both sides race: White’s h-pawn storm vs Black’s …Rc8/…Nc4 and queenside play.',
      },
      {
        id: 'sicilian-accelerated-dragon',
        name: 'Accelerated Dragon',
        sans: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'g6', 'Nc3', 'Bg7', 'Be3', 'Nf6'],
        note:
          '…g6 without an early …d6. You keep the option of …d5 in one move. Watch the Maroczy Bind (c4) — White’s main positional try.',
      },
      {
        id: 'sicilian-hyper-accelerated',
        name: 'Hyper-Accelerated Dragon',
        sans: ['e4', 'c5', 'Nf3', 'g6', 'd4', 'cxd4', 'Nxd4', 'Bg7'],
        note:
          '…g6 on move 2. Very flexible; can transpose to Accelerated Dragon. Punish greedy dxc5 with …Qa5+.',
      },
      {
        id: 'sicilian-maroczy',
        name: 'vs Maroczy Bind',
        sans: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'g6', 'c4', 'Bg7', 'Be3', 'Nf6', 'Nc3', 'O-O'],
        note:
          'White clamps d5 with c4. Play for …d6/…a6/…Bd7/…Nc6-a5 or …b6/…Bb7 Hedgehog setups; don’t force …d5 until you’re ready.',
      },
      {
        id: 'sicilian-classical',
        name: 'Classical',
        sans: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'Nc6'],
        note:
          'Natural piece development. Leads to Richter-Rauzer (Bg5), Sozin/Fischer (Bc4), or quieter Be2/Be3 systems.',
      },
      {
        id: 'sicilian-richter-rauzer',
        name: 'Richter-Rauzer',
        sans: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'Nc6', 'Bg5', 'e6', 'Qd2', 'Be7'],
        note:
          'White pins Nf6 and often castles queenside. Black stays solid with …e6/…Be7 and looks for …a6/…b5 or central breaks.',
      },
      {
        id: 'sicilian-english-attack',
        name: 'Najdorf English Attack',
        sans: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'Be3', 'e5', 'Nb3', 'Be6', 'f3'],
        note:
          'White’s Be3/f3/Qd2/O-O-O setup vs the Najdorf. Opposite-side races: meet the kingside storm with …b5/…Nbd7/…Qc7 and timely …d5.',
      },
      {
        id: 'sicilian-scheveningen',
        name: 'Scheveningen',
        sans: ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'd6'],
        note:
          'The “small center”: pawns on d6 and e6. Solid and flexible. Against the Keres Attack (6.g4), strike back in the center or restrain the pawns with …h6.',
      },
      {
        id: 'sicilian-sveshnikov',
        name: 'Sveshnikov',
        sans: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'e5', 'Ndb5', 'd6'],
        note:
          'Immediate …e5 grabs space and activity at the cost of a hole on d5 and a backward d-pawn. Extremely dynamic piece play.',
      },
      {
        id: 'sicilian-taimanov',
        name: 'Taimanov',
        sans: ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'Nc6', 'Nc3', 'Qc7'],
        note:
          'Flexible …Qc7 setup. Black delays committing the d-pawn and can transpose toward Scheveningen or play …a6/…b5/…Nf6 ideas.',
      },
      {
        id: 'sicilian-kan',
        name: 'Kan / Paulsen',
        sans: ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'a6'],
        note:
          'Early …a6 without …d6 yet. Lower theory than the Najdorf, hedgehog-style structures, and ideas with …Qc7/…Bc5/…b5.',
      },
      {
        id: 'sicilian-four-knights',
        name: 'Four Knights Sicilian',
        sans: ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'Nc6'],
        note:
          'Quick development. Can transpose to Taimanov/Sveshnikov-related structures; useful if you want piece play before pawn commits.',
      },
      {
        id: 'sicilian-alapin',
        name: 'vs Alapin (2.c3)',
        sans: ['e4', 'c5', 'c3', 'Nf6', 'e5', 'Nd5', 'd4', 'cxd4', 'Nf3', 'Nc6', 'cxd4', 'd6'],
        note:
          'White wants a classical center. …Nf6 forces e5 and gives you a strong knight outpost on d5. 2…d5 is the other main equalizer.',
      },
      {
        id: 'sicilian-alapin-d5',
        name: 'vs Alapin with …d5',
        sans: ['e4', 'c5', 'c3', 'd5', 'exd5', 'Qxd5', 'd4', 'Nf6', 'Nf3', 'Bg4'],
        note:
          'Hit the center at once. After exd5 Qxd5 you develop freely; don’t let White’s IQP or isolated-pawn pressure catch you undeveloped.',
      },
      {
        id: 'sicilian-closed',
        name: 'vs Closed Sicilian',
        sans: ['e4', 'c5', 'Nc3', 'Nc6', 'g3', 'g6', 'Bg2', 'Bg7', 'd3', 'd6', 'f4', 'e6', 'Nf3', 'Nge7'],
        note:
          'White plays slowly with g3/Bg2 and often f4. Expand with …a6/…b5 or break with …f5 later; don’t rush …d5 into a locked center.',
      },
      {
        id: 'sicilian-grand-prix',
        name: 'vs Grand Prix Attack',
        sans: ['e4', 'c5', 'Nc3', 'Nc6', 'f4', 'g6', 'Nf3', 'Bg7', 'Bb5', 'Nd4'],
        note:
          'White goes for a kingside attack early. Challenge the bishop, occupy d4 when allowed, and don’t castle into a ready-made pawn storm without counterplay.',
      },
      {
        id: 'sicilian-smith-morra',
        name: 'vs Smith-Morra Gambit',
        sans: ['e4', 'c5', 'd4', 'cxd4', 'c3', 'dxc3', 'Nxc3', 'Nc6', 'Nf3', 'e6', 'Bc4', 'Qc7', 'O-O', 'Nf6'],
        note:
          'White sacrifices a pawn for development. Accept, develop solidly (…e6/…a6/…Qc7/…Nf6), and don’t grab more material if you’re behind in development.',
      },
      {
        id: 'sicilian-wing-gambit',
        name: 'vs Wing Gambit',
        sans: ['e4', 'c5', 'b4', 'cxb4', 'a3', 'd5', 'exd5', 'Qxd5', 'Nf3', 'e5'],
        note:
          'White offers the b-pawn for open lines. Decline or accept calmly; …d5 in the center is often the cleanest equalizer.',
      },
      {
        id: 'sicilian-rossolimo',
        name: 'vs Rossolimo (3.Bb5)',
        sans: ['e4', 'c5', 'Nf3', 'Nc6', 'Bb5', 'g6', 'O-O', 'Bg7', 'Re1', 'e5', 'Bxc6', 'dxc6'],
        note:
          'A popular anti-Open try. You can meet it with …g6, …e6, or …d6. Structure after Bxc6 is key: use the bishop pair and c-file.',
      },
      {
        id: 'sicilian-moscow',
        name: 'vs Moscow (3.Bb5+)',
        sans: ['e4', 'c5', 'Nf3', 'd6', 'Bb5+', 'Bd7', 'Bxd7+', 'Qxd7', 'c4', 'Nf6', 'Nc3', 'g6'],
        note:
          'White avoids main-line Open theory. After the bishop trade, aim for a Hedgehog/Dragon hybrid and timely …b5 or …d5.',
      },
      {
        id: 'sicilian-kalashnikov',
        name: 'Kalashnikov',
        sans: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'e5', 'Nb5', 'd6'],
        note:
          'Like a Sveshnikov without …Nf6 first. Immediate …e5; play revolves around d5 control, …Be7/…a6, and piece activity.',
      },
    ],
    mistakes: [
      {
        id: 'sicilian-siberian',
        title: 'Siberian Trap (Smith-Morra)',
        before: [
          'e4',
          'c5',
          'd4',
          'cxd4',
          'c3',
          'dxc3',
          'Nxc3',
          'Nc6',
          'Nf3',
          'e6',
          'Bc4',
          'Qc7',
          'O-O',
          'Nf6',
          'Qe2',
          'Ng4',
        ],
        mistake: 'h3',
        punish: ['Nd4', 'Nxd4', 'Qh2#'],
        why: 'White’s automatic …h3 ignores the mating pattern: …Nd4 clears the path and …Qh2# is protected by the knight on g4.',
        idea: 'After …Ng4, if White plays h3, jump …Nd4. Taking on d4 allows mate on h2.',
      },
      {
        id: 'sicilian-morra-bxf7',
        title: 'Smith-Morra: premature Bxf7+',
        before: [
          'e4',
          'c5',
          'd4',
          'cxd4',
          'c3',
          'dxc3',
          'Nxc3',
          'Nc6',
          'Nf3',
          'd6',
          'Bc4',
          'Nf6',
        ],
        mistake: 'Bxf7+',
        punish: ['Kxf7', 'Ng5+', 'Kg8', 'Nb5', 'Qa5+', 'Bd2', 'Qb6'],
        why: 'Sacrificing on f7 with no real follow-up just hands Black a piece. The king walks to g8 and White’s attack runs out.',
        idea: 'Take the bishop, answer Ng5+ with …Kg8, then check with …Qa5+ and park the queen on b6 — you’re a piece up.',
      },
      {
        id: 'sicilian-hyper-dxc5',
        title: 'Hyper-Accelerated: greedy dxc5',
        before: ['e4', 'c5', 'Nf3', 'g6', 'd4', 'Bg7'],
        mistake: 'dxc5',
        punish: ['Qa5+', 'c3', 'Qxc5'],
        why: 'Grabbing the c-pawn before developing lets Black check on a5 and recover the pawn with a better queen.',
        idea: '…Qa5+ forces a concession; take back on c5 and enjoy the open game with the fianchetto bishop.',
      },
      {
        id: 'sicilian-early-nxc6',
        title: 'Early Nxc6 into …Qa5+',
        before: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'Nf6'],
        mistake: 'Nxc6',
        punish: ['bxc6', 'e5', 'Qa5+', 'Nc3', 'Qxe5+'],
        why: 'Trading on c6 too early can allow …Qa5+ ideas that pick up the e-pawn with check.',
        idea: 'After Nxc6 bxc6, if White pushes e5, check on a5 and take on e5.',
      },
      {
        id: 'sicilian-dragon-ng4',
        title: 'White ignores …Ng4 in the Dragon',
        before: [
          'e4',
          'c5',
          'Nf3',
          'd6',
          'd4',
          'cxd4',
          'Nxd4',
          'Nf6',
          'Nc3',
          'g6',
          'Be3',
          'Ng4',
        ],
        mistake: 'Bc1',
        punish: ['Nxf2', 'Kxf2', 'e5', 'Nb3', 'Qb6+'],
        why: 'Retreating the bishop passively after …Ng4 lets Black smash f2 and check the exposed king.',
        idea: 'If White doesn’t meet …Ng4 properly (Bb5+/Bg5/Qd2 ideas), take on f2, then …e5 and …Qb6+.',
      },
      {
        id: 'sicilian-yugoslav-slow',
        title: 'Yugoslav Attack without urgency',
        before: [
          'e4',
          'c5',
          'Nf3',
          'd6',
          'd4',
          'cxd4',
          'Nxd4',
          'Nf6',
          'Nc3',
          'g6',
          'Be3',
          'Bg7',
          'f3',
          'O-O',
          'Qd2',
          'Nc6',
          'O-O-O',
          'Bd7',
          'g4',
          'Rc8',
          'h4',
          'Ne5',
        ],
        mistake: 'Kb1',
        punish: ['Rxc3', 'bxc3', 'Qa5'],
        why: 'A slow king move in the middle of a pawn storm gives Black time for the thematic exchange sac on c3.',
        idea: '…Rxc3 wrecks White’s cover; follow with …Qa5 and pile on the c-file/long diagonal.',
      },
      {
        id: 'sicilian-alapin-greedy',
        title: 'Alapin greed on c5',
        before: ['e4', 'c5', 'c3', 'd5', 'exd5', 'Qxd5', 'd4', 'Nc6'],
        mistake: 'dxc5',
        punish: ['Qxd1+', 'Kxd1', 'Bf5', 'Be3', 'O-O-O+'],
        why: 'Grabbing on c5 while undeveloped walks into a queen trade and a raging initiative against the uncastled king.',
        idea: 'Trade queens, develop with tempo, and castle long; White’s king is stuck in the center.',
      },
      {
        id: 'sicilian-closed-premature-f5',
        title: 'Closed Sicilian: premature f5',
        before: [
          'e4',
          'c5',
          'Nc3',
          'Nc6',
          'g3',
          'g6',
          'Bg2',
          'Bg7',
          'd3',
          'd6',
          'f4',
          'e6',
          'Nf3',
          'Nge7',
          'O-O',
          'O-O',
        ],
        mistake: 'f5',
        punish: ['gxf5', 'exf5', 'Nd4', 'Nxd4', 'cxd4', 'Ne4'],
        why: 'Pushing f5 too soon opens lines that Black’s knights are better placed to use.',
        idea: 'Take on f5, plant a knight on d4, and use the e4 outpost — White’s kingside “attack” becomes a weakness.',
      },
      {
        id: 'sicilian-grand-prix-nxd4',
        title: 'Grand Prix: soft Nxd4',
        before: ['e4', 'c5', 'Nc3', 'Nc6', 'f4', 'g6', 'Nf3', 'Bg7', 'Bb5', 'Nd4'],
        mistake: 'Nxd4',
        punish: ['cxd4', 'Ne2', 'Qb6', 'd3', 'Nf6'],
        why: 'Trading the d4 knight without a plan cedes the center and helps Black’s queen/bishop battery.',
        idea: 'Recapture toward the center, eye b2 with …Qb6, and develop while White’s kingside play is delayed.',
      },
      {
        id: 'sicilian-rossolimo-early-bxc6',
        title: 'Rossolimo: early Bxc6 without pressure',
        before: ['e4', 'c5', 'Nf3', 'Nc6', 'Bb5', 'g6'],
        mistake: 'Bxc6',
        punish: ['dxc6', 'd3', 'Bg7', 'O-O', 'e5'],
        why: 'Giving Black the bishop pair and a solid structure for free is a common anti-Sicilian inaccuracy.',
        idea: 'Take toward the center with …dxc6, fianchetto, and seize space with …e5.',
      },
    ],
  },
  {
    id: 'french',
    name: 'French Defense',
    eco: 'C00–C19',
    family: 'Semi-Open',
    forSide: 'black',
    summary:
      '…e6 prepares …d5. Solid central counterplay, with a bad light-squared bishop that you eventually free or trade.',
    plans: [
      'Challenge e4 with …d5, then attack the d4/e5 chain with …c5 and …f6.',
      'Develop the queenside carefully; the c8 bishop is the long-term problem.',
      'In Advance lines, pressure d4 with …Qb6 and …Nc6.',
    ],
    mainLine: {
      id: 'french-advance',
      name: 'Advance Variation',
      sans: ['e4', 'e6', 'd4', 'd5', 'e5', 'c5', 'c3', 'Nc6', 'Nf3', 'Qb6'],
      note: 'Black immediately piles onto d4. Typical French: locked center, play on the wings.',
    },
    variations: [
      {
        id: 'french-winawer',
        name: 'Winawer',
        sans: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Bb4'],
        note: 'Black pins Nc3 and often doubles White’s pawns after …Bxc3+. Strategic and sharp.',
      },
      {
        id: 'french-classical',
        name: 'Classical',
        sans: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Nf6'],
        note: 'Flexible development. White can choose Advance-like structures with e5 or quieter lines.',
      },
    ],
    mistakes: [
      {
        id: 'french-greek-gift',
        title: 'Castling into a Greek Gift',
        before: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Nf6', 'e5', 'Nfd7', 'Bd3', 'c5', 'Nf3', 'Nc6', 'O-O', 'Be7', 'Re1'],
        mistake: 'O-O',
        punish: ['Bxh7+', 'Kxh7', 'Ng5+', 'Kg8', 'Qh5'],
        why: 'If Black’s pieces don’t cover g5/h7 properly, Bxh7+ starts a classic mating attack.',
        idea: 'Sacrifice, check on g5, then Qh5. The rook lift Re1–e3–h3 is a common follow-up.',
      },
      {
        id: 'french-bad-bishop-trap',
        title: 'Leaving the bishop buried',
        before: ['e4', 'e6', 'd4', 'd5', 'e5', 'c5', 'c3', 'Qb6', 'Nf3', 'Bd7', 'a3'],
        mistake: 'Bb5',
        punish: ['Bxb5+', 'Qxb5', 'dxc5'],
        why: 'Trading the “bad” bishop only helps if the resulting structure is fine — here White keeps a healthy extra pawn idea.',
        idea: 'Take on b5 with check and grab/hold the c5 pawn. Black’s early bishop hunt backfires.',
      },
    ],
  },
  {
    id: 'caro-kann',
    name: 'Caro-Kann Defense',
    eco: 'B10–B19',
    family: 'Semi-Open',
    forSide: 'black',
    summary:
      '…c6 prepares …d5 without blocking the light-squared bishop. Rock-solid structure and clear piece play.',
    plans: [
      'Recapture on d5 with the c-pawn and develop Bf5/Bg4 freely.',
      'Castle short and use the c-file later.',
      'Against the Advance, challenge the head of the chain with …c5.',
    ],
    mainLine: {
      id: 'caro-classical',
      name: 'Classical',
      sans: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5', 'Ng3', 'Bg6', 'h4', 'h6', 'Nf3', 'Nd7'],
      note: 'Black develops the bishop outside the chain, then builds a compact kingside.',
    },
    variations: [
      {
        id: 'caro-advance',
        name: 'Advance',
        sans: ['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5', 'Nf3', 'e6', 'Be2', 'c5'],
        note: 'White gains space; Black strikes the base with …c5 while the bishop is already out.',
      },
      {
        id: 'caro-panov',
        name: 'Panov Attack',
        sans: ['e4', 'c6', 'd4', 'd5', 'exd5', 'cxd5', 'c4'],
        note: 'White creates an IQP structure. Open piece play instead of the usual Caro calm.',
      },
    ],
    mistakes: [
      {
        id: 'caro-early-qb6',
        title: 'Queen excursion before development',
        before: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5', 'Ng3', 'Bg6', 'h4', 'h6', 'Nf3'],
        mistake: 'Qb6',
        punish: ['h5', 'Bh7', 'Bd3', 'Bxd3', 'Qxd3'],
        why: '…Qb6 eyes b2 but loses time while White expands on the kingside.',
        idea: 'Push h5, trade the strong bishop, and keep developing with a lasting space pull.',
      },
      {
        id: 'caro-nxe4-greedy',
        title: 'Taking on e4 into a pin',
        before: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Nd7', 'Ng5', 'Ngf6', 'Bd3', 'e6', 'N1f3', 'Bd6', 'Qe2', 'h6', 'Ne4'],
        mistake: 'Nxe4',
        punish: ['Qxe4', 'Nf6', 'Qh4'],
        why: 'Trading knights can walk into Qe4 ideas that hit h7 and keep Black under pressure.',
        idea: 'Recapture with the queen and swing toward the kingside before Black castles comfortably.',
      },
    ],
  },
  {
    id: 'qgd',
    name: "Queen's Gambit Declined",
    eco: 'D30–D69',
    family: 'Closed Games',
    forSide: 'both',
    summary:
      'After 1.d4 d5 2.c4 e6, Black holds the center solidly. Classical plans for both sides: minority attack vs central breaks.',
    plans: [
      'White: develop Nf3/Nc3, exchange on d5, and play the minority attack with b4-b5.',
      'Black: free the light-squared bishop with …dxc4 / …c5 / …e5.',
      'Watch the c6/e6 pawn breaks; timing is everything.',
    ],
    mainLine: {
      id: 'qgd-orthodox',
      name: 'Orthodox',
      sans: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', 'O-O', 'Nf3', 'Nbd7', 'Rc1', 'c6'],
      note: 'Main classical setup. White prepares Bd3 and the minority attack; Black aims for …dxc4 and …e5/…c5.',
    },
    variations: [
      {
        id: 'qgd-exchange',
        name: 'Exchange Variation',
        sans: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'cxd5', 'exd5', 'Bg5'],
        note: 'Fixed Carlsbad structure. White’s plan is b4–b5; Black seeks …Ne4 and kingside play.',
      },
      {
        id: 'qgd-tartakower',
        name: 'Tartakower',
        sans: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', 'O-O', 'Nf3', 'h6', 'Bh4', 'b6'],
        note: 'Black fianchettos the queen bishop. Flexible and theoretically healthy.',
      },
    ],
    mistakes: [
      {
        id: 'qgd-early-bb4',
        title: 'Pinning without support',
        before: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5'],
        mistake: 'Bb4',
        punish: ['cxd5', 'exd5', 'Qa4+', 'Nc6', 'e3'],
        why: '…Bb4 is playable in some lines, but here White can check and force awkward development.',
        idea: 'Open the center, check on a4, and leave Black’s pieces tangled.',
      },
      {
        id: 'qgd-grab-c4',
        title: 'Holding the gambit pawn',
        before: ['d4', 'd5', 'c4', 'dxc4', 'e3'],
        mistake: 'b5',
        punish: ['a4', 'c6', 'axb5', 'cxb5', 'Qf3'],
        why: 'Trying to keep the c4 pawn with …b5 walks into a famous trap.',
        idea: 'a4 undermines the chain; Qf3 hits a8 and wins material.',
      },
    ],
  },
  {
    id: 'london',
    name: 'London System',
    eco: 'D00 / D02',
    family: 'Closed Games',
    forSide: 'white',
    summary:
      'A system opening: Bf4, e3, Nf3, c3. Easy to learn, hard to punish if you know the key breaks.',
    plans: [
      'Complete the London triangle (Bf4/e3/c3) and castle.',
      'Meet …c5 with c3 or dxc5 ideas; meet …Qb6 with Qc1/Qb3.',
      'Typical attacking plan: Ne5, Bd3, and a kingside pawn storm if Black castles short.',
    ],
    mainLine: {
      id: 'london-main',
      name: 'Main Setup',
      sans: ['d4', 'd5', 'Nf3', 'Nf6', 'Bf4', 'e6', 'e3', 'Bd6', 'Bg3', 'O-O', 'Nbd2', 'c5', 'c3'],
      note: 'White keeps a solid structure. The bishop often retreats to g3 to stay useful.',
    },
    variations: [
      {
        id: 'london-jobava',
        name: 'Jobava London',
        sans: ['d4', 'd5', 'Nc3', 'Nf6', 'Bf4'],
        note: 'Faster piece play with Nc3 and ideas of Nb5/Nc7. More aggressive than the quiet London.',
      },
      {
        id: 'london-vs-kings-indian',
        name: 'vs King’s Indian setup',
        sans: ['d4', 'Nf6', 'Nf3', 'g6', 'Bf4', 'Bg7', 'e3', 'O-O', 'Be2', 'd6', 'O-O'],
        note: 'Against fianchetto systems, keep Be2 solid and consider c4 or h3/Bh2.',
      },
    ],
    mistakes: [
      {
        id: 'london-qb6-b2',
        title: 'Snatching b2 against the London',
        before: ['d4', 'd5', 'Nf3', 'Nf6', 'Bf4', 'c5', 'e3', 'Nc6', 'c3', 'Qb6', 'Qa4'],
        mistake: 'Qxb2',
        punish: ['Qb5', 'Qxa1', 'Qxb7'],
        why: 'Taking b2 looks free, but White’s queen raids the queenside and often traps Black’s rook.',
        idea: 'Check/attack with Qb5 and invade b7 before Black untangles.',
      },
      {
        id: 'london-ignore-ne5',
        title: 'Trading into a kingside attack',
        before: ['d4', 'd5', 'Nf3', 'Nf6', 'Bf4', 'e6', 'e3', 'Bd6', 'Bg3', 'O-O', 'Nbd2', 'c5', 'c3', 'Nc6', 'Bd3'],
        mistake: 'Bxg3',
        punish: ['hxg3', 'Qe7', 'Ne5'],
        why: 'Trading on g3 opens the h-file for White’s rook and strengthens Ne5 outposts.',
        idea: 'Recapture with the h-pawn, then plant a knight on e5 and attack.',
      },
    ],
  },
  {
    id: 'kings-indian',
    name: "King's Indian Defense",
    eco: 'E60–E99',
    family: 'Indian Defenses',
    forSide: 'black',
    summary:
      'Black allows White a big center, then attacks it with …e5 or …c5. Perfect for learning pawn storms and piece sacrifices.',
    plans: [
      'Fianchetto, castle, then strike with …e5 (Classical) or …c5 (Benoni-style).',
      'If the center closes (d5), attack the kingside with …f5.',
      'Don’t forget queenside counterplay; White often expands there first.',
    ],
    mainLine: {
      id: 'kid-classical',
      name: 'Classical',
      sans: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'O-O', 'Nc6', 'd5', 'Ne7'],
      note: 'Closed center. Black prepares …f5; White prepares c5 and queenside play.',
    },
    variations: [
      {
        id: 'kid-samisch',
        name: 'Sämisch',
        sans: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'f3'],
        note: 'White reinforces e4 and may castle long. Black must react quickly with …c5 or …e5.',
      },
      {
        id: 'kid-fianchetto',
        name: 'Fianchetto System',
        sans: ['d4', 'Nf6', 'c4', 'g6', 'Nf3', 'Bg7', 'g3', 'O-O', 'Bg2', 'd6', 'O-O'],
        note: 'Quieter anti-KID. Black often plays …c6/…a6 and …b5, or …c5 breaks.',
      },
    ],
    mistakes: [
      {
        id: 'kid-premature-f5',
        title: 'Grabbing e4 too early',
        before: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2'],
        mistake: 'Nxe4',
        punish: ['Nxe4', 'f5', 'Nc3'],
        why: 'The e4 pawn looks loose, but taking it opens lines against Black’s king and center.',
        idea: 'Recapture on e4 and meet …f5 by retreating/redeveloping, keeping a safer king.',
      },
      {
        id: 'kid-ignore-c5',
        title: 'Ignoring the c5 break',
        before: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'O-O', 'Nc6', 'd5', 'Ne7', 'b4'],
        mistake: 'Nd7',
        punish: ['c5', 'dxc5', 'bxc5'],
        why: 'Slow queenside play lets White’s c5 break seize space and open files.',
        idea: 'Push c5 immediately, trade, and invade on the open queenside lines.',
      },
    ],
  },
  {
    id: 'scotch',
    name: 'Scotch Game',
    eco: 'C44–C45',
    family: 'Open Games',
    forSide: 'white',
    summary:
      'Early d4 opens the position. Ideal for learning piece activity, isolated pawn structures, and initiative.',
    plans: [
      'Open the center and develop rapidly.',
      'In the Classical Scotch, use space and pressure on e5/d5.',
      'If queens come off, play for the better structure and piece activity.',
    ],
    mainLine: {
      id: 'scotch-main',
      name: 'Classical Scotch',
      sans: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Nf6', 'Nc3', 'Bb4', 'Nxc6', 'bxc6', 'Bd3'],
      note: 'White accepts doubled c-pawns for Black and keeps a lead in development.',
    },
    variations: [
      {
        id: 'scotch-gambit',
        name: 'Scotch Gambit',
        sans: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Bc4'],
        note: 'Leave the pawn and develop with threats against f7. Great practice for attacking.',
      },
      {
        id: 'scotch-four-knights',
        name: 'Scotch Four Knights',
        sans: ['e4', 'e5', 'Nf3', 'Nc6', 'Nc3', 'Nf6', 'd4'],
        note: 'A calmer relative. Still opens the center early with clear piece play.',
      },
    ],
    mistakes: [
      {
        id: 'scotch-qh4',
        title: 'Early …Qh4 adventure',
        before: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4'],
        mistake: 'Qh4',
        punish: ['Nc3', 'Bb4', 'Be2', 'Qxe4', 'Nb5'],
        why: 'Bringing the queen out early invites tempi and discovered ideas.',
        idea: 'Develop with threats; Nb5 hits c7 and punishes the wandering queen.',
      },
      {
        id: 'scotch-greedy-nxe4',
        title: 'Taking on e4 in the Mieses',
        before: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Bc5', 'Be3', 'Qf6', 'c3'],
        mistake: 'Nge7',
        punish: ['Nc2', 'Bxe3', 'Nxe3'],
        why: 'Developing quietly without watching the bishop on c5 lets White clarify the center favorably.',
        idea: 'Nc2 prepares to take the bishop pair or keep a strong grip on d5/f5 squares.',
      },
    ],
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian Defense',
    eco: 'B01',
    family: 'Semi-Open',
    forSide: 'black',
    summary:
      '…d5 on move one. Immediate clarity: either an early queen or a solid …Qa5/…Nf6 setup with easy development.',
    plans: [
      'After …Qxd5, retreat the queen to a5 and develop with …c6 / …Bf5.',
      'Castle short and use the open d-file.',
      'Don’t let White gain free tempi on your queen forever — finish development.',
    ],
    mainLine: {
      id: 'scandi-main',
      name: 'Main Line …Qa5',
      sans: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qa5', 'd4', 'Nf6', 'Nf3', 'c6', 'Bc4', 'Bf5'],
      note: 'Black’s queen sits safely on a5 while the light-squared bishop gets outside the pawn chain.',
    },
    variations: [
      {
        id: 'scandi-nf6',
        name: 'Modern …Nf6',
        sans: ['e4', 'd5', 'exd5', 'Nf6', 'd4', 'Nxd5', 'Nf3'],
        note: 'Skip the early queen moves. Recapture with the knight and play a more positional game.',
      },
      {
        id: 'scandi-gambit',
        name: 'Blackburne / Portuguese ideas',
        sans: ['e4', 'd5', 'exd5', 'Nf6', 'Bb5+', 'Bd7'],
        note: 'Sharper tries where Black offers a pawn for activity. Know the forcing lines before playing them.',
      },
    ],
    mistakes: [
      {
        id: 'scandi-queen-hang',
        title: 'Leaving the queen on d5',
        before: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3'],
        mistake: 'Nf6',
        punish: ['Nxd5', 'Nxd5'],
        why: 'After Nc3 the queen is attacked. Ignoring it just drops the queen.',
        idea: 'Always meet Nc3 by moving the queen (usually …Qa5 or …Qd8/…Qd6).',
      },
      {
        id: 'scandi-bb4-pin',
        title: 'Careless …Bb4',
        before: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qa5', 'd4', 'c6', 'Nf3', 'Bg4', 'h3', 'Bh5', 'g4', 'Bg6', 'Ne5'],
        mistake: 'e6',
        punish: ['Nxg6', 'hxg6', 'Qd3'],
        why: 'Ignoring the knight on e5 lets White wreck the kingside structure.',
        idea: 'Take on g6 and park the queen on d3, hitting g6 while Black is still undeveloped.',
      },
    ],
  },
]

export const OPENING_FAMILIES = [...new Set(OPENINGS.map((opening) => opening.family))]

export function getOpening(id: string): Opening | undefined {
  return OPENINGS.find((opening) => opening.id === id)
}

export function lineToGame(sans: string[]) {
  return {
    startFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    sans,
    ply: sans.length,
  }
}
