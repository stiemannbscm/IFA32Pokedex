<!-- eslint-disable vue/multi-word-component-names -->
<script>
export default {
  data() {
    return {
      pokemon: null,
      species: null,
      evolution: [],
      loading: true,
    }
  },

  async created() {
    await this.fetchData(this.$route.params.name)
  },

  watch: {
    '$route.params.name'(newName) {
      this.fetchData(newName)
    },
  },

  methods: {
    async fetchData(name) {
      this.loading = true

      // Base Pokémon
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
      this.pokemon = await res.json()

      // Species
      const speciesRes = await fetch(this.pokemon.species.url)
      this.species = await speciesRes.json()

      // Evolution chain
      this.evolution = await this.loadEvolutionChain(this.species.evolution_chain.url)

      this.loading = false
    },

    back() {
      if (history.length > 1) this.$router.back()
      else this.$router.push('/')
    },

    typeColor(type) {
      const colors = {
        fire: '#f08030',
        water: '#6890f0',
        grass: '#78c850',
        electric: '#f8d030',
        ice: '#98d8d8',
        fighting: '#c03028',
        poison: '#a040a0',
        ground: '#e0c068',
        flying: '#a890f0',
        psychic: '#f85888',
        bug: '#a8b820',
        rock: '#b8a038',
        ghost: '#705898',
        dark: '#705848',
        dragon: '#7038f8',
        steel: '#b8b8d0',
        fairy: '#ee99ac',
      }
      return colors[type] || '#aaa'
    },

    statPercent(stat) {
      return (stat / 200) * 100
    },

    flavorText() {
      const entry = this.species.flavor_text_entries.find((f) => f.language.name === 'en')
      return entry ? entry.flavor_text.replace(/\n|\f/g, ' ') : ''
    },

    async loadEvolutionChain(url) {
      const res = await fetch(url)
      const chainData = await res.json()

      const flat = []

      const extract = (node) => {
        const id = node.species.url.split('/')[6]
        const evo = node.evolution_details?.[0]

        flat.push({
          id,
          name: node.species.name,
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
          min_level: evo?.min_level || null,
          trigger: evo?.trigger?.name || null,
        })

        for (const next of node.evolves_to) extract(next)
      }

      extract(chainData.chain)
      return flat
    },
  },
}
</script>

<template>
  <div>
    <button class="back" @click="back">← Back</button>

    <p v-if="loading">Loading…</p>

    <div v-else class="details">
      <h2>{{ pokemon.name }}</h2>

      <img :src="pokemon.sprites.other['official-artwork'].front_default" alt="pokemon" />

      <!-- TYPES -->
      <div class="types">
        <span
          v-for="t in pokemon.types"
          :key="t.type.name"
          class="type"
          :style="{ background: typeColor(t.type.name) }"
        >
          {{ t.type.name }}
        </span>
      </div>

      <!-- DESCRIPTION -->
      <p class="desc">{{ flavorText() }}</p>

      <!-- EVOLUTION CHAIN: direkt unter dem Text -->
      <h3>Evolution Chain</h3>
      <div class="evo-container">
        <div
          v-for="(evo, index) in evolution"
          :key="evo.id"
          class="evo-card"
          @click="$router.push('/pokemon/' + evo.name)"
        >
          <img :src="evo.image" />

          <p class="evo-name">{{ evo.name }}</p>

          <p class="evo-condition" v-if="evo.min_level">Lv. {{ evo.min_level }}</p>

          <p class="evo-condition" v-else-if="evo.trigger && evo.trigger !== 'level-up'">
            {{ evo.trigger }}
          </p>

          <p class="arrow" v-if="index < evolution.length - 1">→</p>
        </div>
      </div>

      <!-- GENERAL INFO -->
      <h3>General Information</h3>
      <div class="info-grid">
        <div class="info-item">
          <img src="https://img.icons8.com/ios-filled/50/rabbit.png" />
          <div>
            <strong>Category</strong>
            <p>{{ species.genera.find((g) => g.language.name === 'en').genus }}</p>
          </div>
        </div>

        <div class="info-item">
          <img src="https://img.icons8.com/ios-filled/50/worldwide-location.png" />
          <div>
            <strong>Habitat</strong>
            <p>{{ species.habitat?.name || 'Unknown' }}</p>
          </div>
        </div>

        <div class="info-item">
          <img src="https://img.icons8.com/ios-filled/50/paint-palette.png" />
          <div>
            <strong>Color</strong>
            <p>{{ species.color.name }}</p>
          </div>
        </div>

        <div class="info-item">
          <img src="https://img.icons8.com/ios-filled/50/cat-footprint.png" />
          <div>
            <strong>Shape</strong>
            <p>{{ species.shape?.name }}</p>
          </div>
        </div>

        <div class="info-item">
          <img src="https://img.icons8.com/ios-filled/50/height.png" />
          <div>
            <strong>Height</strong>
            <p>{{ pokemon.height / 10 }} m</p>
          </div>
        </div>

        <div class="info-item">
          <img src="https://img.icons8.com/ios-filled/50/scale.png" />
          <div>
            <strong>Weight</strong>
            <p>{{ pokemon.weight / 10 }} kg</p>
          </div>
        </div>

        <div class="info-item">
          <img src="https://img.icons8.com/ios-filled/50/trophy.png" />
          <div>
            <strong>Base Experience</strong>
            <p>{{ pokemon.base_experience }}</p>
          </div>
        </div>

        <div class="info-item">
          <img src="https://img.icons8.com/ios-filled/50/gender.png" />
          <div>
            <strong>Gender Ratio</strong>
            <p v-if="species.gender_rate >= 0">
              ♂ {{ (100 - species.gender_rate * 12.5).toFixed(1) }}% • ♀
              {{ (species.gender_rate * 12.5).toFixed(1) }}%
            </p>
            <p v-else>Genderless</p>
          </div>
        </div>

        <div class="info-item">
          <img src="https://img.icons8.com/ios-filled/50/eggs.png" />
          <div>
            <strong>Egg Groups</strong>
            <p>{{ species.egg_groups.map((g) => g.name).join(', ') }}</p>
          </div>
        </div>

        <div class="info-item">
          <img src="https://img.icons8.com/ios-filled/50/comet.png" />
          <div>
            <strong>Growth Rate</strong>
            <p>{{ species.growth_rate.name }}</p>
          </div>
        </div>

        <div class="info-item" v-if="species.is_legendary">
          <img src="https://img.icons8.com/ios-filled/50/crown.png" />
          <div>
            <strong>Legendary</strong>
            <p>Yes</p>
          </div>
        </div>

        <div class="info-item" v-if="species.is_mythical">
          <img src="https://img.icons8.com/ios-filled/50/sparkling.png" />
          <div>
            <strong>Mythical</strong>
            <p>Yes</p>
          </div>
        </div>
      </div>

      <!-- ABILITIES -->
      <h3>Abilities</h3>
      <ul class="abilities">
        <li v-for="a in pokemon.abilities" :key="a.ability.name">
          {{ a.ability.name }}
        </li>
      </ul>

      <!-- STATS -->
      <h3>Stats</h3>
      <div v-for="s in pokemon.stats" :key="s.stat.name" class="stat-row">
        <span class="stat-name">{{ s.stat.name }}</span>

        <div class="bar">
          <div class="fill" :style="{ width: statPercent(s.base_stat) + '%' }"></div>
        </div>

        <span>{{ s.base_stat }}</span>
      </div>
    </div>
  </div>
</template>

<style>
.back {
  background: #ff4444;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 15px;
}

/* CARD */
.details {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  text-align: center;
}

/* IMAGE */
.details img {
  width: 220px;
}

@media (max-width: 600px) {
  .details img {
    width: 150px;
  }
}

/* TYPES */
.types {
  margin: 10px 0;
}

.type {
  display: inline-block;
  padding: 6px 12px;
  color: white;
  border-radius: 20px;
  margin: 4px;
  text-transform: capitalize;
}

/* DESCRIPTION */
.desc {
  margin: 10px 0 20px;
  font-style: italic;
}

/* GENERAL INFO GRID */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  gap: 10px;
  background: #fafafa;
  padding: 12px;
  border-radius: 10px;
  align-items: center;
  text-align: left;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.info-item img {
  width: 38px;
  opacity: 0.8;
}

/* ABILITIES */
.abilities {
  list-style: none;
  padding: 0;
  margin-bottom: 15px;
}

/* STATS */
.stat-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.stat-name {
  width: 100px;
  text-transform: capitalize;
  text-align: right;
}

.bar {
  flex-grow: 1;
  height: 12px;
  background: #eee;
  border-radius: 6px;
  overflow: hidden;
}

.fill {
  background: #ff4444;
  height: 100%;
  transition: width 0.4s;
}

/* EVOLUTION CHAIN */
.evo-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
  margin: 10px 0 25px;
}

.evo-card {
  width: 120px;
  padding: 10px;
  background: #fafafa;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.evo-card:hover {
  transform: translateY(-4px);
}

.evo-card img {
  width: 80px;
  image-rendering: pixelated;
}

.evo-name {
  text-transform: capitalize;
  font-weight: bold;
  margin: 6px 0;
}

.evo-condition {
  font-size: 13px;
  opacity: 0.7;
}

.arrow {
  text-align: center;
  margin-top: 4px;
  font-size: 22px;
  font-weight: bold;
}
</style>
