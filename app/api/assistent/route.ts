import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai"
import { getTopStores } from "@/lib/queries"

export const maxDuration = 30

const CATEGORIES =
  "Elektronica, Mode, Sneakers, Verzamelen, Auto, Motor, Pokemon, Funko, Lego, Gaming, Telefoons, Laptops, Horloges, Meubels, Vintage, Beauty, Sport, Kinderen, Huis & Tuin, Muziek, Boeken, Overig"

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  let storeContext = ""
  try {
    const stores = await getTopStores(6)
    storeContext = stores.map((s) => `${s.name} (${s.category}, in ${s.location})`).join("; ")
  } catch {
    storeContext = "diverse zelfstandige winkels"
  }

  const system = `Je bent de OranjeMarkt assistent, een vriendelijke Nederlandse shopping-hulp voor OranjeMarkt — de digitale bazaar van Nederland waar duizenden zelfstandige winkels een eigen digitale kraam huren.

Jouw taken:
- Help bezoekers producten, winkels (kramen) en categorieën vinden.
- Leg uit hoe verkopen werkt: verkopers huren een abonnement (Gratis €0, Kraam €9,95/mnd, Winkel €24,95/mnd, Premium €49,95/mnd) en betalen GEEN commissie over verkopen.
- Beantwoord veelgestelde vragen over kopen, verkopen, volgen, chatten en favorieten.

Beschikbare categorieën: ${CATEGORIES}.

Enkele populaire winkels op OranjeMarkt: ${storeContext}.

Belangrijke links die je mag noemen: /categorieen (alle categorieën), /kramen (alle winkels), /nieuw (nieuwste producten), /top-verkopers (beste verkopers), /aanbiedingen (deals), /verkoop (kraam huren en abonnementen).

Stijl: antwoord altijd in het Nederlands, kort, behulpzaam en enthousiast. Gebruik geen emoji. Verwijs waar nuttig naar de juiste pagina.`

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system,
    messages: await convertToModelMessages(messages),
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  })
}
