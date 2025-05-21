  toast({
    title: 'Éxito',
    description: 'Pipeline guardado',
  })

  toast({
    variant: 'destructive',
    title: '¡Ups!',
    description: 'No se pudo guardar el pipeline',
  })

  <Card className=" w-full">
    <CardHeader>
      <CardTitle>Detalles del Pipeline</CardTitle>
      <CardDescription>
        Crea un pipeline para tu negocio. Puedes agregar más detalles a este pipeline
        y luego asignar ese pipeline a tus clientes para comenzar a vender productos
        o servicios.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            disabled={isLoading}
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Pipeline</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nombre del pipeline"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            disabled={isLoading}
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="¿Qué hace este pipeline?"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            disabled={isLoading}
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio</FormLabel>
                <FormControl>
                  <Input
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className="mt-4"
            disabled={isLoading}
            type="submit"
          >
            {form.formState.isSubmitting ? (
              <Loading />
            ) : (
              '¡Guardar Pipeline!'
            )}
          </Button>
        </form>
      </Form>
    </CardContent>
  </Card> 