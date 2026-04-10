export const siteCopy = {
  nav: {
    overview: "Overview",
    howItWorks: "How it works",
    evidence: "Evidence",
    runtime: "Runtime",
    primaryCta: "Open Runtime",
  },
  overview: {
    badge: "Web4.0",
    eyebrow: "Autonomous execution engine",
    title: "Turn intent into deployment, release, and proof.",
    body:
      "Laisen prepares a protocol package, checks wallet and network state, and shows each step as execution moves on Base Sepolia.",
    metrics: [
      { label: "Wallet", value: "MetaMask" },
      { label: "Testnet", value: "Base Sepolia" },
      { label: "Flow", value: "Deploy → Release" },
    ],
    product: {
      eyebrow: "What Laisen does",
      title: "Laisen runs the path from intent to release.",
      body:
        "Start with one instruction. Laisen prepares the package, reads the signal, forms the mandate, and keeps wallet, chain, and execution state in view.",
    },
    howItWorks: {
      eyebrow: "How it works",
      title: "Six steps from intent to action.",
      cta: "See the full flow",
      steps: [
        {
          number: "01",
          title: "Set the mission.",
          body: "Enter the job you want the system to run.",
        },
        {
          number: "02",
          title: "Prepare the package.",
          body: "Laisen generates the founder profile, token setup, and operating rules.",
        },
        {
          number: "03",
          title: "Connect the wallet.",
          body: "Use MetaMask and switch to Base Sepolia.",
        },
        {
          number: "04",
          title: "Release the next step.",
          body: "Deploy the contracts, review the mandate, and sign when you are ready.",
        },
      ],
    },
    evidence: {
      eyebrow: "Evidence",
      title: "You can verify every critical step.",
      body:
        "Laisen keeps provider, model, wallet, chain, contract addresses, and execution history visible in one place.",
      rows: [
        { label: "Provider", value: "GMI Cloud" },
        { label: "Model", value: "GLM-5" },
        { label: "Wallet", value: "MetaMask" },
        { label: "Testnet", value: "Base Sepolia" },
        { label: "Schema", value: "Validation state" },
        { label: "History", value: "Execution log" },
      ],
      cta: "See what Laisen exposes",
    },
    finalCta: {
      eyebrow: "Next step",
      title: "Open the workspace.",
      body: "Go straight to wallet, chain, deploy, and release.",
    },
    attribution: {
      eyebrow: "Built with",
      body: "Core infrastructure used in the current Laisen build.",
      items: [
        { name: "GMI Cloud", label: "Inference" },
        { name: "Z.ai", label: "Model" },
        { name: "MetaMask", label: "Wallet" },
        { name: "Base Sepolia", label: "Testnet" },
      ],
    },
  },
  howItWorks: {
    title: "How Laisen works",
    description: "A step-by-step view of how Laisen turns intent into release and execution.",
    eyebrow: "How it works",
    heading: "From intent to release in six steps.",
    body:
      "Laisen keeps the flow short. Prepare the package, connect a wallet, deploy the protocol, and release the next step.",
    sequenceLabel: "Flow",
    sequenceBody: "Each step has one action and one visible outcome.",
    steps: [
      {
        number: "01",
        title: "Set the mission.",
        body: "Enter the goal you want the system to run.",
      },
      {
        number: "02",
        title: "Generate the package.",
        body: "Laisen prepares the founder profile, token setup, and operating rules.",
      },
      {
        number: "03",
        title: "Connect the wallet.",
        body: "Use MetaMask and confirm the wallet that will sign the release.",
      },
      {
        number: "04",
        title: "Switch to Base Sepolia.",
        body: "Laisen checks the chain before it allows deployment.",
      },
      {
        number: "05",
        title: "Deploy and review.",
        body: "Deploy the contracts, read the signal, and review the mandate.",
      },
      {
        number: "06",
        title: "Release or stop.",
        body: "Sign to release, reject, or override.",
      },
    ],
    finalCta: {
      eyebrow: "Next step",
      title: "Open the runtime.",
      body: "The live page keeps wallet state, deployment, and execution on one screen.",
    },
  },
  evidence: {
    title: "Laisen Evidence",
    description:
      "Visible provider, wallet, deployment, schema, and execution state for the current Laisen run.",
    eyebrow: "Evidence",
    heading: "What you can verify in Laisen.",
    body:
      "The product keeps the key facts in view: provider, model, wallet, chain, contract addresses, transaction hashes, and execution history.",
    listLabel: "Visible state",
    listBody: "Each row describes one thing you can verify in the product.",
    rows: [
      {
        label: "Provider",
        value: "GMI Cloud",
        note: "Inference runs through GMI Cloud.",
      },
      {
        label: "Model",
        value: "GLM-5",
        note: "GLM-5 handles package and mandate generation.",
      },
      {
        label: "Tool calls",
        value: "Signal, scheduling, and ledger steps",
        note: "Each call shows a status and a short detail.",
      },
      {
        label: "Wallet + chain",
        value: "MetaMask on Base Sepolia",
        note: "Wallet connection and network state stay visible.",
      },
      {
        label: "Deployment",
        value: "Token and protocol addresses",
        note: "Contract addresses appear after deployment.",
      },
      {
        label: "Schema",
        value: "Pending, valid, fallback, failed",
        note: "Payload health is checked before the run continues.",
      },
      {
        label: "Fallback",
        value: "Safe mode and hard-stop states",
        note: "Failure paths stay visible instead of disappearing into logs.",
      },
      {
        label: "History",
        value: "Time-ordered activity log",
        note: "Each run appends a readable event trail.",
      },
    ],
    fallback: {
      eyebrow: "Fallback",
      title: "Failure states stay explicit.",
      modes: [
        {
          title: "Standard",
          body: "Normal path with live signal, deploy, and release.",
        },
        {
          title: "Safe mode",
          body: "Cached inputs keep the run moving when live infrastructure is unavailable.",
        },
        {
          title: "Failure test",
          body: "A deliberate hard stop shows how the product surfaces failure.",
        },
      ],
    },
    events: {
      eyebrow: "Activity",
      title: "Execution history explains what just happened.",
      stages: [
        {
          name: "Mission saved",
          detail: "The run begins with a stored mission.",
        },
        {
          name: "Wallet ready",
          detail: "The wallet and chain are checked before deployment.",
        },
        {
          name: "Contracts deployed",
          detail: "Deployment adds contract addresses and transaction hashes.",
        },
        {
          name: "Mandate released",
          detail: "The signer either releases or rejects the next step.",
        },
        {
          name: "Execution updated",
          detail: "The log continues as execution advances, pauses, redirects, or completes.",
        },
      ],
    },
    finalCta: {
      eyebrow: "Next step",
      title: "Open the runtime.",
      body: "The runtime page combines live state with wallet and chain actions.",
    },
  },
  runtimePreview: {
    eyebrow: "Runtime",
    title: "Use the live workspace when you're ready to act.",
    body:
      "Connect MetaMask, switch to Base Sepolia, deploy the package, and release the next step.",
    stageLabel: "Above the fold",
    stageBody: "The main actions stay in view: wallet, network, deploy, launch, and release.",
    sequenceLabel: "Core path",
    sequenceValue: "Mission → Wallet → Deploy → Release",
    proofLabel: "What stays visible",
    proofRows: [
      { label: "Provider", value: "GMI Cloud" },
      { label: "Model", value: "GLM-5" },
      { label: "Wallet", value: "MetaMask" },
      { label: "Testnet", value: "Base Sepolia" },
      { label: "Schema", value: "Validation state" },
    ],
    footer: "Open the runtime for the full action path.",
    link: "Open runtime",
  },
  footer: {
    title: "Laisen",
    body: "Autonomous execution with visible wallet, chain, deployment, and release state.",
  },
} as const;
