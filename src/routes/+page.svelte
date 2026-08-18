<script>
  import { fade } from 'svelte/transition'
  
  let { data } = $props()
  const { projects } = data
</script>

<div class="container">
  <header>
    <h1>Amanda's Portfolio</h1>
    <p>Graphic Design & Web Design</p>
  </header>

  <section class="portfolio">
    {#each projects as project (project._id)}
      <div class="project-card" transition:fade={{ duration: 500 }}>
        {#if project.imageUrl}
          <img src={project.imageUrl} alt={project.title} />
        {/if}
        <h2>{project.title}</h2>
        <p>{project.description}</p>
      </div>
    {/each}
  </section>
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  header {
    text-align: center;
    margin-bottom: 4rem;
  }

  header h1 {
    font-size: 3rem;
    margin: 0;
    color: #000;
  }

  header p {
    font-size: 1.2rem;
    color: #666;
    margin: 0.5rem 0 0 0;
  }

  .portfolio {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2rem;
  }

  .project-card {
    border-radius: 12px;
    overflow: hidden;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
  }

  .project-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  img {
    width: 100%;
    height: 250px;
    object-fit: cover;
  }

  .project-card h2 {
    font-size: 1.5rem;
    margin: 1.5rem 1.5rem 0.5rem;
    color: #000;
  }

  .project-card p {
    font-size: 1rem;
    color: #666;
    margin: 0 1.5rem 1.5rem;
  }
</style>