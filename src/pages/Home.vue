<!-- eslint-disable vue/multi-word-component-names -->
<script>
export default {
  data() {
    return {
      allPokemon: [],
      filtered: [],
      loading: true,
      page: 1,
      limit: 25,
      search: "",
      totalPokemon: 1025,
    };
  },

  computed: {
    maxPage() {
      return Math.ceil(this.filtered.length / this.limit);
    },

    visiblePokemon() {
      const start = (this.page - 1) * this.limit;
      return this.filtered.slice(start, start + this.limit);
    },
  },

  watch: {
    search() {
      this.applyFilter();
    },

    "$route.query.page"(value) {
      const p = Number(value);
      if (!isNaN(p)) {
        this.page = p;
      }
    },
  },

  async created() {
    const urlPage = Number(this.$route.query.page);
    if (urlPage > 0) this.page = urlPage;

    await this.loadAllPokemon();
    this.applyFilter();
  },

  methods: {
    async loadAllPokemon() {
      const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
      const data = await res.json();

      this.allPokemon = data.results.map((p) => ({
        name: p.name,
        id: p.url.split("/")[6],
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.url.split("/")[6]}.png`,
      }));

      this.loading = false;
    },

    applyFilter() {
      const s = this.search.toLowerCase();

      this.filtered = this.allPokemon.filter((p) =>
        p.name.toLowerCase().includes(s)
      );

      if (this.page > this.maxPage) this.page = 1;

      this.$router.replace({ query: { page: this.page } });
    },

    nextPage() {
      if (this.page < this.maxPage) {
        this.page++;
        this.$router.replace({ query: { page: this.page } });
      }
    },

    prevPage() {
      if (this.page > 1) {
        this.page--;
        this.$router.replace({ query: { page: this.page } });
      }
    },
  },
};
</script>

<template>
  <div>
    <input
      v-model="search"
      class="search"
      placeholder="Search Pokémon..."
    />

    <p v-if="loading">Loading Pokémon...</p>

    <div v-else class="grid">
      <div
        v-for="p in visiblePokemon"
        :key="p.id"
        class="card"
        @click="$router.push('/pokemon/' + p.name)"
      >
        <img :src="p.image" :alt="p.name" />
        <h3>{{ p.name }}</h3>
      </div>
    </div>

    <div class="pagination" v-if="filtered.length > 0">
      <button @click="prevPage" :disabled="page === 1">← Previous</button>
      <span>Page {{ page }} / {{ maxPage }}</span>
      <button @click="nextPage" :disabled="page === maxPage">Next →</button>
    </div>
  </div>
</template>

<style>
.search {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  margin-bottom: 20px;
  border-radius: 8px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 15px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  cursor: pointer;
  text-align: center;
  box-shadow: 0 3px 8px rgba(0,0,0,0.1);
  transition: 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 14px rgba(0,0,0,0.2);
}

.card img {
  width: 100px;
  height: 100px;
}

.card h3 {
  text-transform: capitalize;
  font-size: 16px;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 25px;
}

.pagination button {
  background: #ff4444;
  border: none;
  padding: 8px 14px;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}

.pagination button:disabled {
  background: #aaa;
  cursor: not-allowed;
}
</style>