const dynamic = async () => {
  const plugins = process.argv.slice(2);

  if (!plugins.length) {
    console.error('Please provide a proper plugin name.');
    return;
  }
  await Promise.all(plugins.map(async (pluginName) => {
    try {
      const plugin = await import(`./plugins/${pluginName}.js`);
      const result = await plugin.run();
      console.log(result);
    } catch (error) {
      console.error('Plugin not found');
      process.exit(1);
    }
  }));
};

await dynamic();
